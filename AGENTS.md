## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- Do not modify or update `graphify-out/` unless the user explicitly requests it.

## Economical subagent policy

- Do not spawn subagents for small or single-file tasks.
- Use at most 2 subagents concurrently.
- Use `luna_explorer` for read-only search, tracing, documentation lookup, and log analysis.
- Use `gpt-5.6-terra` with low reasoning for straightforward implementation.
- Use `gpt-5.6-terra` with medium reasoning for normal multi-file features.
- Escalate to `sol_worker` only for complex debugging, architecture, security, concurrency, migrations, or high-risk review.
- Never assign the same investigation or implementation to multiple agents.
- Reuse an existing agent for related follow-up work instead of spawning a replacement.
- Give each subagent a narrow, self-contained prompt and request a concise result with exact files and symbols.
- Prefer `fork_turns: "none"` or the smallest useful recent-turn window when spawning an agent.
- Keep Fast mode disabled for routine work.

## Research after a failed implementation

- If an implementation or fix does not satisfy the user on the first attempt, stop iterative guessing and research the issue on the web before making another implementation attempt.
- Prefer current official documentation and primary sources for the relevant framework, library, or platform.
- Base the next change on the documented behavior, and cite the sources used when reporting the result.
