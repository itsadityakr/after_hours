var e=`A graph is a set of dots and a set of lines joining them. The dots are vertices,
or nodes; the lines are edges. That is the whole definition, and it is why so
much turns out to be a graph problem. A map of cities, a list of course
prerequisites, a grid of land and water, a set of words joined when they differ
by one letter — every one is dots with lines between them, once you decide what a
dot is.

Three algorithms cover most of what you will be asked: depth-first search,
breadth-first search, and Dijkstra. The work is almost never the algorithm. It is
deciding what a vertex is, deciding what an edge is, and then writing a traversal
you already know. And a warning: a large share of the problems here do not look
like graphs at all. They are grids, and there is a section on that below.

## Vertices, edges, and the words you need

\`\`\`text
   0 ---- 1          undirected: the edge 0-1 can be walked either way
   |    / |
   |   /  |          vertices: 0 1 2 3 4 5
   2 -/   3          edges:    0-1  0-2  1-2  1-3  4-5

   4 ---- 5          two pieces, so this graph has two components
\`\`\`

- A **vertex** is a thing, an **edge** joins two of them. Two vertices sharing an
  edge are **neighbours**, and a vertex's number of neighbours is its **degree**.
- **Undirected** means an edge works both ways — a road. **Directed** means one
  way only — a prerequisite. In code the difference is a single line: whether you
  add the edge to both neighbour lists or to one.
- **Weighted** means each edge carries a number: a distance, a cost, a time.
  Unweighted is the same as every edge costing 1.
- A **path** is a sequence of vertices each joined to the next; a **cycle** is a
  path back to where it started. A connected graph with no cycle is a **tree**,
  and a tree on V vertices has exactly V − 1 edges.
- A **component** is a maximal set of vertices reachable from each other. The
  picture has two.
- A directed graph with no cycles is a **DAG**. It is the only kind you can put
  in a topological order, and it is what course-schedule problems are about.

Throughout, \`V\` is the number of vertices and \`E\` the number of edges. Both
appear in every cost on the page, so get used to naming them.

## Three ways to write a graph down

The input is usually a number \`n\` and a list of pairs. What you build from those
pairs is a real choice. The adjacency list is the one to write first; the matrix
is \`int[][] m = new int[n][n]\` with \`m[u][v] = 1\` per edge, and the edge list is
the pairs left exactly as they came.

\`\`\`java
int[][] edges = { {0, 1}, {0, 2}, {1, 2}, {1, 3}, {4, 5} };

List<List<Integer>> adj = new ArrayList<>();
for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
for (int[] e : edges) {
    adj.get(e[0]).add(e[1]);
    adj.get(e[1]).add(e[0]);      // delete this line and the graph is directed
}
\`\`\`

| Form | Space | Is u–v an edge? | Neighbours of u | Reach for it when |
|---|---|---|---|---|
| Adjacency list | O(V + E) | O(degree) | O(degree) | Almost always |
| Adjacency matrix | O(V²) | O(1) | O(V) | V is small, or you ask "is there an edge" constantly |
| Edge list | O(E) | O(E) | O(E) | You only sort or sweep the edges — Kruskal, Bellman-Ford |

The list is the default because real graphs are sparse: a road network has a
handful of roads per town, not one to every other town. A matrix on 10⁵ vertices
would need 10¹⁰ cells, which fits nowhere. A matrix is right when V is a few
hundred and the algorithm keeps asking "are these two joined".

## Depth-first search, and breadth-first search

DFS goes as deep as it can, then backs up and takes the next unexplored branch.
Recursion does the backing up for you.

\`\`\`java
static void dfs(int u, List<List<Integer>> adj, boolean[] seen) {
    seen[u] = true;                          // mark on arrival
    for (int v : adj.get(u))
        if (!seen[v]) dfs(v, adj, seen);
}
\`\`\`

\`seen\` is not an optimisation, it is what makes the function terminate. Without
it, \`dfs(0)\` on the picture above walks 0 → 1 → 0 → 1 forever, because 0 and 1
are each other's neighbours. Every graph traversal has a visited set. A tree does
not need one only because a tree has no cycles, which is why tree recursion feels
easier than graph recursion.

Recursion depth is the longest path, so 10⁵ vertices in a line overflow the JVM
stack. The iterative form uses a stack of your own:

\`\`\`java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(src);
while (!stack.isEmpty()) {
    int u = stack.pop();
    if (seen[u]) continue;       // it can be pushed more than once before it pops
    seen[u] = true;
    for (int v : adj.get(u)) if (!seen[v]) stack.push(v);
}
\`\`\`

BFS visits everything one step away, then everything two steps away. A queue does
the bookkeeping, and the vertex is marked seen when you **enqueue** it, never when
you dequeue it — wait until it comes off and a vertex with three neighbours joins
the queue three times, which quietly makes the traversal quadratic.

\`\`\`java
Queue<Integer> q = new ArrayDeque<>();
seen[src] = true;
q.add(src);
while (!q.isEmpty()) {
    int u = q.poll();
    for (int v : adj.get(u))
        if (!seen[v]) { seen[v] = true; q.add(v); }
}
\`\`\`

BFS gives the shortest path in an **unweighted** graph, and the reason is the
queue: it only ever holds distance \`d\` followed by distance \`d + 1\`. So the first
time you reach a vertex is by the fewest possible edges, and \`dist[v] =
dist[u] + 1\` written on that first arrival is final.

\`\`\`text
graph: 0-1  0-2  1-3  2-3  3-4

layer 0     0              layer 2     3     (reached from 1, and first)
layer 1     1  2           layer 3     4

queue over time: [0] [1,2] [2,3] [3] [4] []
\`\`\`

DFS gives no such promise. From 0 it might walk 0 → 2 → 3 → 1 and record 1 as
three steps away when it is one. DFS finds *a* path; BFS finds the *shortest*
one. "Minimum number of moves", with every move the same cost, is a BFS — reach
for the queue before you have finished reading the question.

![BFS spreading in layers, so the first arrival at a vertex is final](diagrams/graphs-notes-bfs-layers.jpg)

A \`dist\` array filled with −1 doubles as the visited set: \`dist[v] == -1\` means
unvisited. One fewer array is one fewer thing to forget.

## A traversal, end to end

\`\`\`java Traverse.java @run-graphs-traverse
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class Traverse {

    static List<List<Integer>> build(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) {
            adj.get(e[0]).add(e[1]);
            adj.get(e[1]).add(e[0]);
        }
        return adj;
    }

    static void dfs(List<List<Integer>> adj, int u, boolean[] seen, List<Integer> order) {
        seen[u] = true;
        order.add(u);
        for (int v : adj.get(u)) if (!seen[v]) dfs(adj, v, seen, order);
    }

    /** Edges from src to every vertex, or -1 where there is no route at all. */
    static int[] bfs(List<List<Integer>> adj, int src) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, -1);
        dist[src] = 0;
        Queue<Integer> q = new ArrayDeque<>();
        q.add(src);
        while (!q.isEmpty()) {
            int u = q.poll();
            for (int v : adj.get(u))
                if (dist[v] == -1) {
                    dist[v] = dist[u] + 1;
                    q.add(v);
                }
        }
        return dist;
    }

    public static void main(String[] args) {
        List<List<Integer>> adj = build(6,
                new int[][] { { 0, 1 }, { 0, 2 }, { 1, 3 }, { 2, 3 }, { 4, 5 } });

        List<Integer> order = new ArrayList<>();
        dfs(adj, 0, new boolean[6], order);
        System.out.println("dfs order      " + order);
        System.out.println("bfs distances  " + Arrays.toString(bfs(adj, 0)));

        boolean[] seen = new boolean[6];
        int components = 0;
        for (int i = 0; i < 6; i++)                 // start again wherever nothing reached
            if (!seen[i]) {
                components++;
                dfs(adj, i, seen, new ArrayList<>());
            }
        System.out.println("components     " + components);
    }
}
\`\`\`

\`\`\`output @run-graphs-traverse
dfs order      [0, 1, 3, 2]
bfs distances  [0, 1, 1, 2, -1, -1]
components     2
\`\`\`

Vertices 4 and 5 come back as −1: they are in the other component and no number
of steps reaches them. Counting components is nothing more than "start a DFS
wherever no earlier DFS reached, and count the starts" — that loop is the whole
of [Number of Provinces](problem:number-of-provinces) and, on a grid, of
[Number of Islands](problem:number-of-islands). Leave it out and you only ever
see vertex 0's component.

## Cycles, and why the two kinds are different

In an **undirected** graph, carry the vertex you came from. A visited neighbour
that is not your parent is a way back, so it is a cycle.

\`\`\`java
static boolean hasCycle(int u, int parent, List<List<Integer>> adj, boolean[] seen) {
    seen[u] = true;
    for (int v : adj.get(u)) {
        if (!seen[v]) { if (hasCycle(v, u, adj, seen)) return true; }
        else if (v != parent) return true;
    }
    return false;
}
\`\`\`

The parent check is needed because every undirected edge looks like a two-step
cycle from inside the traversal: you walk \`u → v\`, and \`v\` finds \`u\` in its own
neighbour list, already visited.

On a **directed** graph that check is wrong. Take \`0 → 1\`, \`0 → 2\`, \`1 → 2\`. DFS
goes 0, 1, 2, returns, then tries \`0 → 2\` and finds 2 visited and not its parent
— but there is no way back to 0 from anywhere. The question is not "have I seen
this vertex" but "am I currently inside it", and that needs three states:

\`\`\`java
// 0 = untouched, 1 = on the current recursion stack, 2 = finished
static boolean hasCycle(int u, List<List<Integer>> adj, int[] colour) {
    colour[u] = 1;
    for (int v : adj.get(u)) {
        if (colour[v] == 1) return true;                      // an edge back into
        if (colour[v] == 0 && hasCycle(v, adj, colour)) return true;
    }
    colour[u] = 2;                                            // your own path
    return false;
}
\`\`\`

Colour 1 means "this vertex's call has not returned yet". Colour 2 means
"explored and finished with", and an edge into one of those is harmless. Confusing
the two is the usual reason [Course Schedule](problem:course-schedule) reports a
cycle on a graph that has none.

![On a directed graph, visited is not the same as on the recursion stack](diagrams/graphs-notes-directed-colours.jpg)

## Topological order, two ways

A topological order lists a DAG's vertices so every edge points forwards. "Take A
before B" is an edge A → B, and a valid study order is a topological order.

Kahn's method is mechanical: repeatedly take a vertex nothing points at. A
vertex's in-degree is the number of edges arriving at it.

\`\`\`text
edges: 0->1  0->2  1->3  2->3

indeg   0:0  1:1  2:1  3:2      queue [0]
take 0  ->  1:0  2:0            queue [1, 2]   order [0]
take 1  ->  3:1                 queue [2]      order [0, 1]
take 2  ->  3:0                 queue [3]      order [0, 1, 2]
take 3                          queue []       order [0, 1, 2, 3]
\`\`\`

The DFS method is shorter: run a DFS, and when a vertex's call is about to return
— everything it can reach is already placed — push it onto the front of the
answer. That is post-order, reversed.

\`\`\`java Topo.java @run-graphs-topo
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Deque;
import java.util.List;
import java.util.Queue;

public class Topo {

    static List<List<Integer>> directed(int n, int[][] edges) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(e[1]);
        return adj;
    }

    /** Kahn: peel off vertices nothing points at. Null when the graph is cyclic. */
    static int[] kahn(int n, List<List<Integer>> adj) {
        int[] indeg = new int[n];
        for (int u = 0; u < n; u++)
            for (int v : adj.get(u)) indeg[v]++;

        Queue<Integer> q = new ArrayDeque<>();
        for (int i = 0; i < n; i++) if (indeg[i] == 0) q.add(i);

        int[] order = new int[n];
        int placed = 0;
        while (!q.isEmpty()) {
            int u = q.poll();
            order[placed++] = u;
            for (int v : adj.get(u))
                if (--indeg[v] == 0) q.add(v);
        }
        return placed == n ? order : null;      // stuck early means a cycle
    }

    static boolean visit(int u, List<List<Integer>> adj, int[] colour, Deque<Integer> out) {
        colour[u] = 1;
        for (int v : adj.get(u)) {
            if (colour[v] == 1) return false;
            if (colour[v] == 0 && !visit(v, adj, colour, out)) return false;
        }
        colour[u] = 2;
        out.push(u);                            // finished, so it belongs in front
        return true;
    }

    static int[] byDfs(int n, List<List<Integer>> adj) {
        int[] colour = new int[n];
        Deque<Integer> out = new ArrayDeque<>();
        for (int i = 0; i < n; i++)
            if (colour[i] == 0 && !visit(i, adj, colour, out)) return null;
        int[] order = new int[n];
        for (int i = 0; i < n; i++) order[i] = out.pop();
        return order;
    }

    static String show(int[] o) {
        return o == null ? "no order, there is a cycle" : Arrays.toString(o);
    }

    public static void main(String[] args) {
        List<List<Integer>> dag =
                directed(4, new int[][] { { 0, 1 }, { 0, 2 }, { 1, 3 }, { 2, 3 } });
        System.out.println("kahn   " + show(kahn(4, dag)));
        System.out.println("dfs    " + show(byDfs(4, dag)));

        List<List<Integer>> cyclic = directed(3, new int[][] { { 0, 1 }, { 1, 2 }, { 2, 0 } });
        System.out.println("kahn   " + show(kahn(3, cyclic)));
        System.out.println("dfs    " + show(byDfs(3, cyclic)));
    }
}
\`\`\`

\`\`\`output @run-graphs-topo
kahn   [0, 1, 2, 3]
dfs    [0, 2, 1, 3]
kahn   no order, there is a cycle
dfs    no order, there is a cycle
\`\`\`

The two give different orders and both are correct — a DAG usually has many. What
matters is the failure test. In Kahn's it is \`placed == n\`: if the queue empties
early, the vertices left over are exactly the ones tangled in a cycle, each
waiting on another that is waiting on it. In the DFS version it is meeting a
colour-1 vertex. Either way, "could not consume every vertex" and "there is a
cycle" are the same statement, which is why
[Course Schedule II](problem:course-schedule-ii) returns an empty array on
failure. [Alien Dictionary](problem:alien-dictionary) is this algorithm once you
have pulled the letter ordering out of adjacent words, and the pulling out is the
harder half.

## Dijkstra, when the edges have weights

BFS counts edges, and the moment an edge has a length that is the wrong answer:
three short hops can beat one long one. Dijkstra is BFS with the queue replaced
by a priority queue keyed on distance so far, so you always expand the nearest
unfinished vertex.

Why it works: if the smallest tentative distance on the queue is \`d\`, nothing can
beat it, because any other route leaves through a vertex already at \`d\` or more
and then adds a non-negative edge. So the vertex you pop is finished. That
argument uses "non-negative" twice, which is why the algorithm falls apart
without it.

\`\`\`java Dijkstra.java @run-graphs-dijkstra
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class Dijkstra {

    static final int INF = Integer.MAX_VALUE / 4;   // room to add without overflow

    /** adj.get(u) holds pairs { neighbour, weight }. */
    static List<List<int[]>> build(int n, int[][] edges) {
        List<List<int[]>> adj = new ArrayList<>();
        for (int i = 0; i < n; i++) adj.add(new ArrayList<>());
        for (int[] e : edges) adj.get(e[0]).add(new int[] { e[1], e[2] });
        return adj;
    }

    static int[] dijkstra(List<List<int[]>> adj, int src) {
        int[] dist = new int[adj.size()];
        Arrays.fill(dist, INF);
        dist[src] = 0;

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(x -> x[1]));
        pq.add(new int[] { src, 0 });

        while (!pq.isEmpty()) {
            int[] top = pq.poll();
            int u = top[0], d = top[1];
            if (d > dist[u]) continue;              // a stale copy, already settled
            for (int[] e : adj.get(u)) {
                int v = e[0], w = e[1];
                if (d + w < dist[v]) {
                    dist[v] = d + w;
                    pq.add(new int[] { v, dist[v] });
                }
            }
        }
        return dist;
    }

    /** The common form that never revisits a settled vertex. Wrong on negatives. */
    static int[] settledForm(List<List<int[]>> adj, int src) {
        int n = adj.size();
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        boolean[] done = new boolean[n];

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(x -> x[1]));
        pq.add(new int[] { src, 0 });
        while (!pq.isEmpty()) {
            int u = pq.poll()[0];
            if (done[u]) continue;
            done[u] = true;
            for (int[] e : adj.get(u))
                if (!done[e[0]] && dist[u] + e[1] < dist[e[0]]) {
                    dist[e[0]] = dist[u] + e[1];
                    pq.add(new int[] { e[0], dist[e[0]] });
                }
        }
        return dist;
    }

    /** Bellman-Ford: relax every edge V - 1 times. Null on a negative cycle. */
    static int[] bellmanFord(int n, int[][] edges, int src) {
        int[] dist = new int[n];
        Arrays.fill(dist, INF);
        dist[src] = 0;
        for (int round = 0; round < n - 1; round++)
            for (int[] e : edges)
                if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]])
                    dist[e[1]] = dist[e[0]] + e[2];

        for (int[] e : edges)                       // one more round must change nothing
            if (dist[e[0]] != INF && dist[e[0]] + e[2] < dist[e[1]]) return null;
        return dist;
    }

    public static void main(String[] args) {
        int[][] roads = { { 0, 1, 4 }, { 0, 2, 1 }, { 2, 1, 2 }, { 1, 3, 5 }, { 2, 3, 8 } };
        System.out.println("all positive       " + Arrays.toString(dijkstra(build(4, roads), 0)));

        int[][] negative = { { 0, 1, 1 }, { 0, 2, 2 }, { 2, 1, -5 }, { 1, 3, 1 } };
        System.out.println("negative, settled  "
                + Arrays.toString(settledForm(build(4, negative), 0)));
        System.out.println("negative, bellman  "
                + Arrays.toString(bellmanFord(4, negative, 0)));

        int[][] loop = { { 0, 1, 1 }, { 1, 2, -1 }, { 2, 1, -1 } };
        System.out.println("negative cycle     "
                + (bellmanFord(3, loop, 0) == null ? "no answer exists" : "?"));
    }
}
\`\`\`

\`\`\`output @run-graphs-dijkstra
all positive       [0, 3, 1, 8]
negative, settled  [0, 1, 2, 2]
negative, bellman  [0, -3, 2, -2]
negative cycle     no answer exists
\`\`\`

On the first graph, 0 → 2 → 1 costs 3 and the direct edge 0 → 1 costs 4, so
Dijkstra takes the two-hop route. That is precisely what BFS cannot see.

![Fewest edges is not the cheapest route once edges carry a weight](diagrams/graphs-notes-weighted-shortest.jpg)

On the second, the settled form is wrong: it finishes vertex 1 at distance 1, and
only afterwards discovers 0 → 2 → 1 costing −3. Vertex 1 is done by then, so
nothing beyond it is corrected and vertex 3 keeps the stale answer 2 instead of
−2. That is not a coding slip, it is the algorithm's assumption being false.

\`if (d > dist[u]) continue;\` is not optional either. Every improvement pushes
another copy, so the queue holds up to E entries and most are out of date when
they surface. That line drops them in O(1); without it the same vertex is
expanded repeatedly and the cost stops being O(E log V). \`PriorityQueue\` has no
decrease-key operation, which is exactly why pushing a duplicate is the standard
trick.

## Negative weights, and Bellman-Ford

If any weight can be negative, use Bellman-Ford, the third method above. It gives
up on being clever and relaxes every edge, V − 1 times over.

V − 1 rounds is enough because a shortest path uses at most V − 1 edges: one that
repeats a vertex contains a cycle you could delete. After round \`k\`, every
shortest path of at most \`k\` edges is correct, so after V − 1 they all are.

Then run one more round. If anything still improves, some route can be shortened
without limit, which happens only when a cycle's weights sum to a negative number
— walk it again and you have done better, so no shortest path exists. That is
what the \`null\` means.

| Situation | Use |
|---|---|
| Unweighted, or every edge the same weight | BFS, O(V + E) |
| Weights, all non-negative | Dijkstra, O(E log V) |
| Any weight may be negative | Bellman-Ford, O(V · E) |
| Weights are only 0 and 1 | 0-1 BFS with a [deque](#/dsa/deque/notes), O(V + E) |

Bellman-Ford is much slower. Reach for it when the problem says a weight can be
negative, and only then.

## Union-find, and the minimum spanning tree

Sometimes the question is only "are these two in the same piece", asked many
times, with the edges arriving as you go. Union-find — disjoint set union, DSU —
answers that in effectively constant time. Each set keeps one representative;
\`find(x)\` walks up to it and \`union(a, b)\` points one representative at the other.

\`\`\`java
class DSU {
    int[] parent, rank;

    DSU(int n) {
        parent = new int[n];
        rank = new int[n];
        for (int i = 0; i < n; i++) parent[i] = i;         // everybody alone
    }

    int find(int x) {
        if (parent[x] != x) parent[x] = find(parent[x]);   // path compression
        return parent[x];
    }

    boolean union(int a, int b) {
        int ra = find(a), rb = find(b);
        if (ra == rb) return false;                        // already together
        if (rank[ra] < rank[rb]) { int t = ra; ra = rb; rb = t; }
        parent[rb] = ra;                                   // shallower under deeper
        if (rank[ra] == rank[rb]) rank[ra]++;
        return true;
    }
}
\`\`\`

Two lines do the work. **Path compression** points every vertex on the way up
straight at the representative, so the next walk is one step. **Union by rank**
puts the shallower tree under the deeper one so the trees never get tall. With
both, m operations cost O(m · α(n)), where α is the inverse Ackermann function
and is below 5 for any n you will meet. Say "effectively constant", not
"constant".

\`union\` returning \`false\` is the useful part: it means this edge would close a
cycle. That fact alone gives Kruskal's minimum spanning tree, the cheapest set of
edges that keeps everything connected:

\`\`\`java
Arrays.sort(edges, (x, y) -> Integer.compare(x[2], y[2]));   // cheapest first
DSU dsu = new DSU(n);
int total = 0, used = 0;
for (int[] e : edges)
    if (dsu.union(e[0], e[1])) { total += e[2]; used++; }
// used == n - 1 means everything is connected; fewer means it never could be
\`\`\`

That is the whole algorithm, and it is why union-find turns up in
[Remove Max Number of Edges to Keep Graph Fully Traversable](problem:remove-max-number-of-edges-to-keep-graph-fully-traversable).
Grouping problems such as [Accounts Merge](problem:accounts-merge) are the same
structure with a map from name to index in front of it.

## The grid is a graph

This is the section to remember. In a grid problem every cell is a vertex and
every pair of side-by-side cells is an edge. So V = rows × cols, and because a
cell has at most four neighbours, E ≤ 4V — E is O(V), and a grid traversal costs
O(rows × cols). Nothing more. The only new code generates the neighbours:

\`\`\`java
static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

for (int[] d : DIRS) {
    int nr = r + d[0], nc = c + d[1];
    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;   // off the grid
    if (grid[nr][nc] != wanted) continue;                         // a wall
}
\`\`\`

Write the range test before the array read, always, or you throw before you get
the chance to reject the cell.

- **Flood fill and islands.** DFS or BFS from each unvisited cell of the right
  type, counting the starts: [Flood Fill](problem:flood-fill),
  [Number of Islands](problem:number-of-islands),
  [Island Perimeter](problem:island-perimeter).
- **Fewest steps.** BFS, since every step costs one:
  [Shortest Path in Binary Matrix](problem:shortest-path-in-binary-matrix).
- **Multi-source BFS.** Put every starting cell in the queue before the loop, all
  at distance 0, and the layers spread from all of them at once. That is
  [Rotting Oranges](problem:rotting-oranges), and it is the trick behind
  [Pacific Atlantic Water Flow](problem:pacific-atlantic-water-flow) — start from
  the edges and search inland rather than asking of each cell where it drains.
- **A cost to cross a cell.** Dijkstra on the grid:
  [Swim in Rising Water](problem:swim-in-rising-water).

You rarely build an adjacency list for a grid. The grid is the adjacency list and
the direction array is how you read it.

## What it costs

| Job | Time | Space |
|---|---|---|
| Build an adjacency list | O(V + E) | O(V + E) |
| DFS or BFS over everything | O(V + E) | O(V), plus the stack or queue |
| Components, cycles, topological sort | O(V + E) | O(V) |
| Dijkstra with a binary heap | O(E log V) | O(V + E) |
| Bellman-Ford | O(V · E) | O(V) |
| Union-find, m operations | O(m · α(n)) | O(n) |
| Kruskal | O(E log E), the sort | O(V) |

O(V + E) is the honest cost of a traversal, and the reason is worth saying out
loud: each vertex is marked once and each edge is looked at once from each end.
Not O(V × E), and not O(V²) unless the graph really is dense. For a grid, V + E
is about 5 × rows × cols, so it is linear in the cells. Dijkstra is O(E log V)
because each edge can cause one push, and heap pushes and pops cost log of the
heap size — see [heaps](#/dsa/heaps/notes).

## The mistakes, in the order people make them

1. **No visited set.** The traversal never ends, and not quietly — it overflows
   the stack or fills the queue.
2. **Marking as seen on dequeue.** The vertex enters the queue once per neighbour
   pointing at it, and the BFS silently goes quadratic. Mark it as you add it.
3. **Adding an undirected edge in one direction only.** Half the graph is
   unreachable and the answer is quietly too small.
4. **The parent check on a directed graph.** It reports a cycle where two paths
   merge. Directed needs three colours or a recursion-stack flag.
5. **No outer loop over start vertices.** Traversing from 0 reaches only 0's
   component. Anything about components, or any graph that may be disconnected,
   needs the \`for (i = 0; i < n; i++)\` wrapper.
6. **Dijkstra without \`if (d > dist[u]) continue;\`**, or Dijkstra on negative
   weights. The first expands a vertex once per push; the second does not
   complain, it just returns a wrong answer.
7. **\`Integer.MAX_VALUE\` as infinity, then adding to it.** It wraps to a large
   negative number and every later comparison is nonsense. Use
   \`Integer.MAX_VALUE / 4\`, or \`long\`, or guard the addition.
8. **Recursing over 10⁵ vertices in a line**, when the JVM stack is roughly 10⁴
   frames deep. Go iterative, or use BFS.
9. **Bounds-checking a grid cell after reading it.** The range test comes first.

## The Java you will reach for

| You want | Write |
|---|---|
| An adjacency list | \`List<List<Integer>>\`, one \`new ArrayList<>()\` per vertex |
| A weighted one | \`List<List<int[]>>\` holding \`new int[] { neighbour, weight }\` |
| A queue | \`Queue<Integer> q = new ArrayDeque<>();\` with \`add\` and \`poll\` |
| A stack | \`Deque<Integer> st = new ArrayDeque<>();\` with \`push\` and \`pop\` |
| A priority queue by distance | \`new PriorityQueue<>(Comparator.comparingInt(x -> x[1]))\` |
| An unreachable marker | \`Arrays.fill(dist, -1)\` for BFS, \`Integer.MAX_VALUE / 4\` for Dijkstra |
| The four grid directions | \`int[][] DIRS = { {1,0}, {-1,0}, {0,1}, {0,-1} }\` |
| A visited grid | \`boolean[][] seen = new boolean[rows][cols]\` |

\`poll\` returns \`null\` on an empty queue and \`remove\` throws, so prefer \`poll\` and
test \`isEmpty\` in the loop condition. \`ArrayDeque\` refuses to hold \`null\`, which
is a help rather than a nuisance — it turns a silent bug into an exception.

## Working one from the sheet

[Rotting Oranges](problem:rotting-oranges). A grid holds 0 for empty, 1 for a
fresh orange, 2 for a rotten one. Each minute, a rotten orange rots every fresh
neighbour it touches. How many minutes until nothing fresh is left, or −1 if some
orange can never rot?

"Each minute, everything one step away" is a BFS layer. The only wrinkle is that
the rot starts in several places at once, so every rotten cell goes into the
queue before the loop begins. The answer is the number of layers, and the −1 case
is simply whether any fresh orange is left when the queue runs dry.

\`\`\`java Oranges.java @run-graphs-oranges
import java.util.ArrayDeque;
import java.util.Queue;

public class Oranges {

    static final int[][] DIRS = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

    static int minutes(int[][] grid) {
        int rows = grid.length, cols = grid[0].length;
        Queue<int[]> q = new ArrayDeque<>();
        int fresh = 0;

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == 2) q.add(new int[] { r, c });
                else if (grid[r][c] == 1) fresh++;
            }

        if (fresh == 0) return 0;          // nothing to rot, so no time passes

        int time = 0;
        while (!q.isEmpty() && fresh > 0) {
            int layer = q.size();          // fix the size before draining it
            for (int i = 0; i < layer; i++) {
                int[] cell = q.poll();
                for (int[] d : DIRS) {
                    int nr = cell[0] + d[0], nc = cell[1] + d[1];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
                    if (grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;      // rotting it is also marking it seen
                    fresh--;
                    q.add(new int[] { nr, nc });
                }
            }
            time++;                        // one whole layer is one minute
        }
        return fresh == 0 ? time : -1;
    }

    public static void main(String[] args) {
        System.out.println(minutes(new int[][] { { 2, 1, 1 }, { 1, 1, 0 }, { 0, 1, 1 } }));
        System.out.println(minutes(new int[][] { { 2, 1, 1 }, { 0, 1, 1 }, { 1, 0, 1 } }));
        System.out.println(minutes(new int[][] { { 0, 2 } }));
        System.out.println(minutes(new int[][] { { 1 } }));
    }
}
\`\`\`

\`\`\`output @run-graphs-oranges
4
-1
0
-1
\`\`\`

Three details do the work. \`int layer = q.size()\` is read before the inner loop,
so a minute is exactly the cells that were rotten when it began; read it inside
and the minute never ends. \`grid[nr][nc] = 2\` is both the state change and the
visited mark, so no second array is needed. And \`time\` only increases while fresh
oranges remain, which is why the last layer adds no spurious minute. The second
grid answers −1 because the bottom-left orange is walled off by empty cells; the
fourth answers −1 because there is nothing rotten to start from.

## How to work through the topic

1. [Find if Path Exists in Graph](problem:find-if-path-exists-in-graph) and
   [Find the Town Judge](problem:find-the-town-judge). Build the adjacency list by
   hand, run one DFS. The judge needs no traversal at all, only in-degree and
   out-degree — a graph question sometimes has a counting answer.
2. [Flood Fill](problem:flood-fill), [Island Perimeter](problem:island-perimeter),
   [Number of Islands](problem:number-of-islands). The grid as a graph. Write the
   direction array once and get used to the bounds check.
3. [Number of Provinces](problem:number-of-provinces). Components — do it twice,
   once with DFS and once with union-find, and compare.
4. [Rotting Oranges](problem:rotting-oranges) and
   [Pacific Atlantic Water Flow](problem:pacific-atlantic-water-flow).
   Multi-source BFS, and searching backwards from the destination.
5. [Course Schedule](problem:course-schedule) then
   [Course Schedule II](problem:course-schedule-ii). Directed cycles, then a
   topological order. Kahn's method first; the DFS version makes more sense after.
6. [Clone Graph](problem:clone-graph) and
   [Accounts Merge](problem:accounts-merge). A traversal that builds as it goes,
   and a union-find with a map in front of it. Bookkeeping, not algorithms.
7. [Network Delay Time](problem:network-delay-time), then
   [Swim in Rising Water](problem:swim-in-rising-water),
   [Word Ladder](problem:word-ladder) and
   [Alien Dictionary](problem:alien-dictionary). Dijkstra plain, Dijkstra with the
   cost redefined, and then two where the graph is hidden rather than given. For
   the last pair, write down what a vertex is and what an edge is before writing
   any code — [Bus Routes](problem:bus-routes) and
   [Critical Connections in a Network](problem:critical-connections-in-a-network)
   are the same lesson, harder.
`;export{e as default};