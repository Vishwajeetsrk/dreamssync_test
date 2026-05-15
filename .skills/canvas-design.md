# Skill: Canvas Design
## Purpose
Implementation of interactive visualizations like Career Roadmaps and Ikigai charts.

## Implementation Patterns
- **SVG vs Canvas**: Use SVG for interactive nodes (Roadmaps); use Canvas for high-frequency particles or complex data viz.
- **Animations**: Use Framer Motion for UI-level transitions.
- **Visual Style**: Maintain Neo-Brutalist borders even in data viz. Use sharp connecting lines (no bezier curves unless specifically requested).
- **Responsiveness**: Always use `viewBox` for SVGs to ensure scaling and maintain visibility on mobile.
