import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export default function CitationGraph({ threadId, initialGraphData }) {
  const svgRef = useRef(null);
  const [graphData, setGraphData] = useState(initialGraphData || null);
  const [loading, setLoading] = useState(!initialGraphData);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialGraphData) {
      setGraphData(initialGraphData);
      setLoading(false);
      return;
    }

    if (!threadId) return;

    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/export/citation-graph/${threadId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load citation graph data.");
        return res.json();
      })
      .then((data) => {
        setGraphData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("⚠️ CitationGraph fetch error:", err.message);
        setError(err.message);
        setLoading(false);
      });
  }, [threadId, initialGraphData]);

  useEffect(() => {
    if (!graphData || !graphData.nodes || graphData.nodes.length === 0 || !svgRef.current) return;

    const width = 600;
    const height = 400;

    // Clear previous SVG contents
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Zoom container
    const g = svg.append("g");

    const zoom = d3.zoom().on("zoom", (event) => {
      g.attr("transform", event.transform);
    });

    svg.call(zoom);

    // Clone nodes and links to prevent direct mutation of state
    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = (graphData.edges || []).map((d) => ({ ...d }));

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(70)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30));

    // Render links
    const link = g
      .append("g")
      .attr("stroke", "#475569")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", (d) => Math.sqrt(d.value || 1) * 1.5);

    // Node group
    const node = g
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .call(
        d3
          .drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );

    // Node circles & shapes
    node
      .append("circle")
      .attr("r", (d) => (d.group === "Act" ? 18 : d.group === "PRECEDENT" ? 14 : 10))
      .attr("fill", (d) => {
        if (d.group === "Act") return "#f59e0b"; // Gold
        if (d.group === "PRECEDENT") return "#a855f7"; // Purple
        if (d.group === "RULE") return "#06b6d4"; // Cyan
        return "#3b82f6"; // Blue
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2);

    // Node labels
    node
      .append("text")
      .text((d) => d.label)
      .attr("x", 14)
      .attr("y", 4)
      .attr("fill", "#e2e8f0")
      .attr("font-size", "10px")
      .attr("font-family", "sans-serif")
      .attr("font-weight", (d) => (d.group === "Act" ? "bold" : "normal"));

    // Tooltip hover title
    node.append("title").text((d) => `${d.label} (${d.group})`);

    // Simulation tick updates
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    return () => simulation.stop();
  }, [graphData]);

  if (loading) {
    return (
      <div className="p-4 text-center text-slate-400 text-sm animate-pulse">
        🌐 Building Legal Citation Co-Occurrence Graph...
      </div>
    );
  }

  if (error || !graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="p-4 text-center text-slate-500 text-xs italic">
        Citation network graph available after verdict adjudication.
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <span>🌐</span> Interactive Statutory Citation Co-Occurrence Network
        </h4>
        <span className="text-xs text-slate-400">D3 Force Layout (Drag & Zoom)</span>
      </div>
      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
        <svg ref={svgRef}></svg>
      </div>
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Act Root
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Statutory Section
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Precedent Case
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 inline-block"></span> Official Rule
        </span>
      </div>
    </div>
  );
}
