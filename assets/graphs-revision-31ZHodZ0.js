var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The vocabulary

- V vertices, E edges. Undirected means both ways; directed means one. Weighted
  means an edge carries a number.
- A tree is a connected graph with no cycle, and has exactly V − 1 edges. A DAG
  is a directed graph with no cycle — the only kind with a topological order.
- Adjacency list \`List<List<Integer>>\` unless V is small and you keep asking "is
  there an edge", which is when a matrix wins.

## The traversal

![Marking a vertex seen on enqueue rather than on dequeue](diagrams/graphs-revision-mark-on-enqueue.jpg)

\`\`\`java
Queue<Integer> q = new ArrayDeque<>();
seen[src] = true;
while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : adj.get(u)) if (!seen[v]) { seen[v] = true; q.add(v); }
}
\`\`\`

- Mark as seen when you **enqueue**, not when you dequeue, or a vertex joins the
  queue once per neighbour pointing at it.
- BFS gives the shortest path in an unweighted graph because the queue holds only
  distance \`d\` then \`d + 1\`. DFS gives a path, not the shortest one.
- \`Arrays.fill(dist, -1)\` makes \`dist\` the visited set as well.
- DFS recursion depth is the longest path — 10⁵ in a line overflows the stack.
  Use an explicit \`ArrayDeque\` and test \`seen\` after popping.
- Loop over start vertices or you only see one component; counting those starts
  is the component count.

## Which algorithm

| Question | Answer | Cost |
|---|---|---|
| Reachable? Components? | DFS or BFS | O(V + E) |
| Fewest moves, all equal | BFS | O(V + E) |
| Shortest with non-negative weights | Dijkstra, \`PriorityQueue\` | O(E log V) |
| Weights may be negative | Bellman-Ford, V − 1 rounds | O(V · E) |
| Valid order under prerequisites | Kahn's, or DFS post-order reversed | O(V + E) |
| Same piece? Cheapest connecting set | Union-find, Kruskal | O(m · α(n)) |

## Cycles and order

- Undirected: DFS carrying the parent. A visited neighbour that is not the parent
  is a cycle.
- Directed: three colours. 1 = on the recursion stack, 2 = finished. An edge into
  a colour-1 vertex is a cycle; into a colour-2 vertex it is nothing.
- Kahn's: queue the in-degree-zero vertices, decrement as you remove. If fewer
  than n come out, the rest are in a cycle.
- DFS topological sort: push a vertex when its call returns, then read the stack.
- "Could not place every vertex" and "has a cycle" are the same sentence.

## Dijkstra

\`\`\`java
PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(x -> x[1]));
while (!pq.isEmpty()) {
    int[] top = pq.poll();
    int u = top[0], d = top[1];
    if (d > dist[u]) continue;              // stale copy, already settled
    for (int[] e : adj.get(u))
        if (d + e[1] < dist[e[0]]) {
            dist[e[0]] = d + e[1];
            pq.add(new int[] { e[0], dist[e[0]] });
        }
}
\`\`\`

- No decrease-key in \`PriorityQueue\`, so push a duplicate and skip the stale one.
- Non-negative weights only. On a negative edge it returns a wrong answer without
  complaining.
- Infinity is \`Integer.MAX_VALUE / 4\`, never \`Integer.MAX_VALUE\` — you add to it.
- Bellman-Ford: relax all edges V − 1 times; one more round that still improves
  means a negative cycle and no answer.

## Union-find

- \`find\` with path compression: \`if (parent[x] != x) parent[x] = find(parent[x]);\`
- \`union\` by rank, returning \`false\` when the two are already joined — that
  \`false\` is "this edge closes a cycle".
- Kruskal: sort edges by weight, union each, take the ones that return \`true\`.
  \`n - 1\` accepted edges means everything is connected.

## Grids

![A grid is already an adjacency list, read through the direction array](diagrams/graphs-revision-grid-is-a-graph.jpg)

- Every cell is a vertex, every side-by-side pair an edge. V = rows × cols and
  E ≤ 4V, so a traversal is O(rows × cols).
- \`int[][] DIRS = { {1,0}, {-1,0}, {0,1}, {0,-1} }\`, and the bounds test comes
  before the array read.
- Multi-source BFS: put every start in the queue before the loop, all at
  distance 0.
- Read \`int layer = q.size()\` before the inner loop when the layer count is the
  answer. Inside, the layer never ends. Overwriting the cell can be the visited
  mark — no second array needed.

## The bugs

- No visited set, so the traversal never returns.
- An undirected edge added in one direction only, or no outer loop over start
  vertices on a graph that is disconnected.
- The parent check used on a directed graph.
- Dijkstra without the stale-entry skip, or on negative weights.
- \`Integer.MAX_VALUE\` as infinity, then added to.
- Bounds check after the grid read instead of before.
`;export{e as default};