var e=`A queue is a line at a counter. You join at the back, you are served from the
front, and nobody jumps. First in, first out — FIFO. It is the other half of the
idea behind [stacks](#/dsa/stacks/notes), and swapping which end you take from
changes the character of every algorithm built on top of it.

The reason a queue matters is breadth-first search. If you want the *shortest*
route, or everything at distance one before anything at distance two, you need
to finish with the near things before you start on the far ones — and that is
what taking from the front gives you. A stack would take you down one branch
until it ran out, which is depth-first, and depth-first has no idea whether the
path it found is short.

The rest of the topic is the same structure worn differently: a sliding window
where old entries expire from the front, a queue built out of two stacks, and a
ring buffer that reuses its slots instead of growing.

## The structure, and the class to use

\`\`\`java
Queue<Integer> q = new ArrayDeque<>();

q.offer(3);            // join the back
q.offer(7);
int front = q.peek();  // 3  — look at the front, do not remove
int served = q.poll(); // 3  — serve the front
boolean none = q.isEmpty();
\`\`\`

\`Queue\` is the interface. \`ArrayDeque\` is what to put behind it: a circular
array, O(1) at both ends, no per-element object like a linked node. \`LinkedList\`
also implements \`Queue\` and works, but it allocates a node per element and
scatters them across memory, so it is slower for no gain — see
[deque](#/dsa/deque/notes) for why that one keeps turning up anyway.

\`ArrayDeque\` rejects \`null\` for the same reason a stack does: \`peek()\` returns
\`null\` to mean "empty", so a \`null\` element would make the answer ambiguous.

\`PriorityQueue\` also implements \`Queue\`, and it is **not** first in, first out —
it serves the smallest element instead. It shares the interface and not the
behaviour, which is a genuine source of confusion. That one belongs to
[heaps](#/dsa/heaps/notes).

## Two families of method, and why it matters

\`Queue\` declares six methods that do three things. The difference is entirely
what they do when the queue is empty or full.

| Job | Throws on failure | Returns a value instead |
|---|---|---|
| Add to the back | \`add(x)\` — \`IllegalStateException\` | \`offer(x)\` — returns \`false\` |
| Remove the front | \`remove()\` — \`NoSuchElementException\` | \`poll()\` — returns \`null\` |
| Look at the front | \`element()\` — \`NoSuchElementException\` | \`peek()\` — returns \`null\` |

Use \`offer\`/\`poll\`/\`peek\`. Not because exceptions are bad, but because the whole
BFS loop is written as \`while (!q.isEmpty())\` and a returning method reads
consistently with it.

Three traps live in this table:

- **\`add\` and \`offer\` behave identically on \`ArrayDeque\`,** which grows without
  limit, so nothing ever fails and you will not notice you picked the wrong one
  until you swap in a bounded queue.
- **\`remove()\` with no arguments serves the front. \`remove(Object)\` searches the
  whole queue and deletes the first match, in O(n).** Same name, different
  method, and on a \`Queue<Integer>\` the compiler picks \`remove(Object)\` for
  \`q.remove(3)\` — that removes the value 3, not the third element.
- **\`poll()\` returning \`null\` on an empty queue will unbox into a
  \`NullPointerException\`** if you assign it straight to an \`int\`. Check
  \`isEmpty()\` first.

One more, because it catches people who have just learnt the stack names: on
\`ArrayDeque\`, \`push\` is \`addFirst\` and \`offer\` is \`offerLast\`, so they add to
**opposite ends**. The full table of aliases is on the
[deque](#/dsa/deque/notes) page.

## The idea: breadth-first search

![The queue holds one distance and the start of the next, never the whole graph](diagrams/queues-notes-frontier.jpg)

Take a grid where \`.\` is open and \`#\` is a wall, and you want the fewest steps
from the top-left to the bottom-right.

Put the start in a queue and mark it seen. Then repeatedly: serve the front,
look at its neighbours, and any neighbour you have not seen goes on the back
marked seen. Because the queue serves in arrival order, and everything one step
from the start arrives before anything two steps away, the first time you reach
a cell is by a shortest route.

\`\`\`text
grid          . . . #        start at (0,0), target (2,3)
              # . # .
              . . . .

serve (0,0) d=0   push (0,1)                        queue: (0,1)
serve (0,1) d=1   push (0,2) (1,1)                  queue: (0,2) (1,1)
serve (0,2) d=2   nothing new — (0,3) is a wall     queue: (1,1)
serve (1,1) d=2   push (2,1)                        queue: (2,1)
serve (2,1) d=3   push (2,0) (2,2)                  queue: (2,0) (2,2)
serve (2,0) d=4   nothing new                       queue: (2,2)
serve (2,2) d=4   push (2,3)  <- the target, at distance 5
\`\`\`

The one rule that makes this correct: **mark a cell as seen when you push it,
not when you serve it.** If you wait, a cell with two neighbours already in the
queue gets pushed twice, and on a large grid that duplication grows until the
queue is the size of the search rather than the size of the frontier.

## The level-by-level loop

![Reading q.size() in the loop bound means the level never ends](diagrams/queues-notes-fix-the-size.jpg)

Often you do not want a single distance, you want everything grouped by
distance — the levels of a tree, one round of a simulation, the set of cells at
exactly k steps. The trick is to fix the size of the queue before you start
draining it.

\`\`\`java
Queue<Node> q = new ArrayDeque<>();
q.offer(root);
while (!q.isEmpty()) {
    int size = q.size();               // fix it first
    for (int i = 0; i < size; i++) {
        Node n = q.poll();
        // ... visit n, and offer its children
    }
    // one level finished here
}
\`\`\`

Everything in the queue at the top of the outer loop is exactly one level. The
inner loop serves precisely that many, and the children pushed during it land
behind them, forming the next level.

Read \`q.size()\` into a variable. If you write \`for (int i = 0; i < q.size(); i++)\`
the bound is re-read every step, it grows as you push children, and the level
never ends — you get one flat traversal with no level boundaries and no error
message. This is the single most common bug in the topic.

\`\`\`java Bfs.java @run-queues-bfs
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.List;
import java.util.Queue;

public class Bfs {

    /** Fewest steps from the top-left to the bottom-right. -1 when unreachable. */
    static int shortest(String[] rows) {
        int h = rows.length, w = rows[0].length();
        boolean[][] seen = new boolean[h][w];
        int[][] steps = { { 1, 0 }, { -1, 0 }, { 0, 1 }, { 0, -1 } };

        Queue<int[]> q = new ArrayDeque<>();          // { row, col, distance }
        q.offer(new int[] { 0, 0, 0 });
        seen[0][0] = true;

        while (!q.isEmpty()) {
            int[] cell = q.poll();
            if (cell[0] == h - 1 && cell[1] == w - 1) return cell[2];
            for (int[] s : steps) {
                int r = cell[0] + s[0], c = cell[1] + s[1];
                if (r < 0 || r >= h || c < 0 || c >= w) continue;   // off the grid
                if (seen[r][c] || rows[r].charAt(c) == '#') continue;
                seen[r][c] = true;                   // marked on push, not on serve
                q.offer(new int[] { r, c, cell[2] + 1 });
            }
        }
        return -1;
    }

    /** The same queue, drained a level at a time. */
    static List<List<Integer>> levels(int[] parentOf) {
        List<List<Integer>> out = new ArrayList<>();
        Queue<Integer> q = new ArrayDeque<>();
        q.offer(0);
        while (!q.isEmpty()) {
            int size = q.size();                     // fix the size first
            List<Integer> level = new ArrayList<>();
            for (int i = 0; i < size; i++) {
                int node = q.poll();
                level.add(node);
                for (int child = 0; child < parentOf.length; child++)
                    if (parentOf[child] == node) q.offer(child);
            }
            out.add(level);
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(shortest(new String[] { "...#", "#.#.", "...." }));
        System.out.println(shortest(new String[] { ".#", "#." }));       // walled off
        System.out.println(shortest(new String[] { "." }));              // already there

        // parentOf[i] is i's parent, and -1 marks the root.
        System.out.println(levels(new int[] { -1, 0, 0, 1, 1, 2 }));
    }
}
\`\`\`

\`\`\`output @run-queues-bfs
5
-1
0
[[0], [1, 2], [3, 4, 5]]
\`\`\`

The grid search stores \`{ row, col, distance }\` in an \`int[]\` because a queue
holds one object per entry and the distance has to travel with the cell. The
alternative is a second \`int[][] dist\` array filled in as you push, which is
what you want the moment you need the distance to a cell you are not currently
serving.

## A sliding window over a queue

[Number of Recent Calls](problem:number-of-recent-calls) is the smallest useful
non-BFS queue. Calls arrive with increasing timestamps; after each one, report
how many arrived in the last 3000 milliseconds.

Because the timestamps only increase, anything that has expired is at the
**front** — it is the oldest. So push the new time on the back, then drop from
the front while the front is too old. The size of what is left is the answer.

\`\`\`java
Queue<Integer> calls = new ArrayDeque<>();

int ping(int t) {
    calls.offer(t);
    while (calls.peek() < t - 3000) calls.poll();   // expire from the front
    return calls.size();
}
\`\`\`

\`\`\`expected
ping(1)     -> 1
ping(100)   -> 2
ping(3001)  -> 3
ping(3002)  -> 3      the call at t = 1 has expired
\`\`\`

That is the same shape as a [sliding window](#/dsa/sliding-window/notes) over an
array, with the queue standing in for the two indices. Each call is offered once
and polled once, so n calls cost O(n) in total even though one \`ping\` can poll
many times — the amortised argument again.
[Moving Average from Data Stream](problem:moving-average-from-data-stream) and
[Design Hit Counter](problem:design-hit-counter) are the same idea with a fixed
count and a fixed span.

## A queue from two stacks

![Pouring one stack into another reverses it, and each element crosses once](diagrams/queues-notes-two-stacks.jpg)

[Implement Queue using Stacks](problem:implement-queue-using-stacks) sounds like
a puzzle and is really a lesson about amortised cost.

One stack cannot do it: a stack hands back the newest element and a queue wants
the oldest. Two stacks can, because pouring one stack into another reverses it.
Keep an **in** stack and an **out** stack. Push always goes to \`in\`. Pop takes
from \`out\` — and if \`out\` is empty, first pour everything from \`in\` into it,
which puts the oldest element on top.

\`\`\`text
push 1, 2, 3        in: 3 2 1 (top first)      out: empty

pop  -> out is empty, so pour:
        in: empty                              out: 1 2 3 (top first)
        pop out -> 1

push 4              in: 4                      out: 2 3
pop  -> out is not empty, no pour needed       out: 3      returns 2
\`\`\`

The pour is O(n), so one \`pop\` can be expensive. But an element is moved from
\`in\` to \`out\` **at most once in its life** — once it is in \`out\` it never goes
back. So across n pushes and n pops there are at most n pours of one element
each: O(1) amortised per operation. Only pour when \`out\` is empty; pouring
eagerly breaks the argument and mixes the order.

\`\`\`java TwoStackQueue.java @run-queues-two-stack-queue
import java.util.ArrayDeque;
import java.util.Deque;

public class TwoStackQueue {

    private final Deque<Integer> in = new ArrayDeque<>();
    private final Deque<Integer> out = new ArrayDeque<>();

    void push(int x) { in.push(x); }

    /** Only ever pour when out is empty — that is what keeps this amortised O(1). */
    private void refill() {
        if (out.isEmpty()) while (!in.isEmpty()) out.push(in.pop());
    }

    int pop()  { refill(); return out.pop(); }
    int peek() { refill(); return out.peek(); }
    boolean empty() { return in.isEmpty() && out.isEmpty(); }

    public static void main(String[] args) {
        TwoStackQueue q = new TwoStackQueue();
        q.push(1);
        q.push(2);
        q.push(3);
        System.out.println("peek  " + q.peek());   // 1, the oldest
        System.out.println("pop   " + q.pop());    // 1
        q.push(4);                                 // arrives behind 2 and 3
        System.out.println("pop   " + q.pop());    // 2
        System.out.println("pop   " + q.pop());    // 3
        System.out.println("pop   " + q.pop());    // 4
        System.out.println("empty " + q.empty());
    }
}
\`\`\`

\`\`\`output @run-queues-two-stack-queue
peek  1
pop   1
pop   2
pop   3
pop   4
empty true
\`\`\`

## The circular buffer

[Design Circular Queue](problem:design-circular-queue) asks for a queue of fixed
capacity backed by a plain array, with no shifting. Let the indices wrap round
the end of the array rather than moving the data. Keep \`head\`, the index of the
front, and \`size\`, how many are stored; the back is then
\`(head + size) % capacity\`, so there is no second index to keep in step.

\`\`\`java
class Ring {
    private final int[] a;
    private int head = 0, size = 0;

    Ring(int capacity) { a = new int[capacity]; }

    boolean enqueue(int x) {
        if (size == a.length) return false;          // full
        a[(head + size) % a.length] = x;
        size++;
        return true;
    }
    boolean dequeue() {
        if (size == 0) return false;                 // empty
        head = (head + 1) % a.length;
        size--;
        return true;
    }
    int front() { return size == 0 ? -1 : a[head]; }
    int rear()  { return size == 0 ? -1 : a[(head + size - 1) % a.length]; }
}
\`\`\`

Storing \`size\` rather than a \`tail\` index is what makes this short. With \`head\`
and \`tail\` alone, "full" and "empty" both look like \`head == tail\`, and you need
a wasted slot or a spare flag to tell them apart. This is roughly what
\`ArrayDeque\` is internally, with the capacity a power of two so the \`%\` becomes
a bitmask. The both-ends version is
[Design Circular Deque](problem:design-circular-deque), on the
[deque](#/dsa/deque/notes) page.

## What it costs

| Operation | Cost | Why |
|---|---|---|
| \`offer\`, \`poll\`, \`peek\` on \`ArrayDeque\` | O(1) | one array slot, one index moved |
| \`q.remove(Object)\` | O(n) | it searches |
| \`q.contains(x)\` | O(n) | a queue is not a set — keep a \`boolean[] seen\` |
| BFS over a graph | O(V + E) | each vertex enqueued once, each edge looked at once |
| BFS over a grid | O(rows × cols) | four neighbours each, a constant |
| Queue from two stacks | amortised O(1) | each element pours across at most once |
| Space | O(width of the frontier) | the widest level, not the whole graph |

That last row is the one people get wrong when asked. BFS space is the size of
the widest level; on a complete binary tree that is about half the nodes, so
O(n). Depth-first would have used O(height) — the trade you make for shortest
paths.

## The mistakes, in the order people make them

1. **Reading \`q.size()\` inside the loop bound.** The level never ends. Fix the
   size in a variable first.
2. **Marking seen when you serve, not when you push.** Duplicates enter the
   queue, distances come out right but the queue blows up, and on a big grid it
   times out.
3. **Using a \`Stack\` and expecting shortest paths.** LIFO explores one branch to
   the end. It finds *a* path, not the shortest.
4. **Unboxing a \`null\` from \`poll()\`.** \`int x = q.poll()\` on an empty queue
   throws \`NullPointerException\`, not something helpful.
5. **\`q.remove(3)\` on a \`Queue<Integer>\`.** That is \`remove(Object)\`, so it
   deletes the value 3 from the middle. \`q.remove()\` with no arguments is the
   one that serves the front.
6. **\`PriorityQueue\` where you meant FIFO.** It compiles, it implements \`Queue\`,
   and it serves the smallest instead of the oldest.
7. **Offering \`null\` into an \`ArrayDeque\`.** \`NullPointerException\` on the
   \`offer\`, not later.
8. **Forgetting the start cell.** It must be marked seen before the loop, or the
   search walks back onto it.
9. **Checking for the target only when you serve it.** That is correct but does
   extra work; checking on push is fine too, as long as you do it in exactly one
   of the two places and know which.

## The Java you will reach for

| You want | Write |
|---|---|
| A queue | \`Queue<Integer> q = new ArrayDeque<>()\` |
| Join the back | \`q.offer(x)\` — \`add(x)\` throws instead of returning \`false\` |
| Serve the front | \`q.poll()\` — \`null\` if empty; \`remove()\` throws |
| Look at the front | \`q.peek()\` — \`null\` if empty; \`element()\` throws |
| How many | \`q.size()\`, \`q.isEmpty()\` |
| Start from one item | \`Queue<Node> q = new ArrayDeque<>(List.of(root))\` |
| Queue of triples | \`Queue<int[]> q\` with \`new int[] { r, c, d }\` |
| Seen set for a grid | \`boolean[][] seen = new boolean[h][w]\` |
| Seen set for states | \`Set<String> seen = new HashSet<>()\` |
| The four neighbours | \`int[][] steps = { {1,0}, {-1,0}, {0,1}, {0,-1} }\` |
| Smallest-first, not oldest-first | \`PriorityQueue\` — a different structure |

## Working one from the sheet

[Open the Lock](problem:open-the-lock). Four wheels, each \`0\`–\`9\` and wrapping.
From \`"0000"\`, each move turns one wheel one step. Some codes are dead ends you
must never land on. Find the fewest moves to a target.

It does not look like a grid, and it is one. A state is a four-character string,
its neighbours are the eight strings one turn away, and "fewest moves" is a
shortest path over that graph — so it is BFS, with a \`HashSet\` doing the job the
\`boolean[][]\` did for a grid. See [graphs](#/dsa/graphs/notes) for the general
version of this.

\`\`\`java Lock.java @run-queues-lock
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Queue;
import java.util.Set;

public class Lock {

    static int openLock(String[] deadends, String target) {
        Set<String> blocked = new HashSet<>(Arrays.asList(deadends));
        if (blocked.contains("0000")) return -1;

        Queue<String> q = new ArrayDeque<>();
        Set<String> seen = new HashSet<>();
        q.offer("0000");
        seen.add("0000");
        int turns = 0;

        while (!q.isEmpty()) {
            int size = q.size();                     // one level is one extra turn
            for (int i = 0; i < size; i++) {
                String state = q.poll();
                if (state.equals(target)) return turns;
                for (String next : neighbours(state)) {
                    if (seen.contains(next) || blocked.contains(next)) continue;
                    seen.add(next);                  // marked on push
                    q.offer(next);
                }
            }
            turns++;
        }
        return -1;
    }

    /** The eight states one wheel-turn away, in a fixed order so runs agree. */
    static String[] neighbours(String s) {
        String[] out = new String[8];
        char[] c = s.toCharArray();
        for (int wheel = 0; wheel < 4; wheel++) {
            char was = c[wheel];
            c[wheel] = (char) ('0' + (was - '0' + 1) % 10);
            out[wheel * 2] = new String(c);
            c[wheel] = (char) ('0' + (was - '0' + 9) % 10);
            out[wheel * 2 + 1] = new String(c);
            c[wheel] = was;                          // put the wheel back
        }
        return out;
    }

    public static void main(String[] args) {
        System.out.println(openLock(new String[] { "0201", "0101", "0102", "1212", "2002" }, "0202"));
        System.out.println(openLock(new String[] { "8888" }, "0009"));       // one turn down
        System.out.println(openLock(new String[] { "0000" }, "8888"));       // start is dead
        System.out.println(openLock(new String[] { "8887", "8889", "8878", "8898", "8788", "8988", "7888", "9888" }, "8888"));
    }
}
\`\`\`

\`\`\`output @run-queues-lock
6
1
-1
-1
\`\`\`

Three details worth copying. \`+ 9\` rather than \`- 1\` before the \`% 10\`, so the
arithmetic never goes negative — Java's \`%\` keeps the sign of the left operand,
and \`-1 % 10\` is \`-1\`, not \`9\`. The wheel is restored with \`c[wheel] = was\`
before moving to the next one, the same undo discipline as backtracking. And the
\`turns++\` sits outside the inner loop, so it counts levels rather than states.

## How to work through the topic

1. [Number of Recent Calls](problem:number-of-recent-calls),
   [Moving Average from Data Stream](problem:moving-average-from-data-stream),
   [Time Needed to Buy Tickets](problem:time-needed-to-buy-tickets). The queue as
   a queue. Expire from the front, join at the back, nothing clever.
2. [Implement Queue using Stacks](problem:implement-queue-using-stacks),
   [Design Circular Queue](problem:design-circular-queue). Build the structure.
   Be able to state the amortised argument for the first and the wrap-around
   arithmetic for the second.
3. [Number of Students Unable to Eat Lunch](problem:number-of-students-unable-to-eat-lunch),
   [Dota2 Senate](problem:dota2-senate),
   [Reveal Cards In Increasing Order](problem:reveal-cards-in-increasing-order).
   Simulation. Rotate by polling the front and offering it back, and always work
   out what makes the loop stop.
4. [Shortest Path in Binary Matrix](problem:shortest-path-in-binary-matrix),
   [Open the Lock](problem:open-the-lock). BFS proper. Write the marked-on-push
   loop twice, once on a grid and once on states that are strings.
5. [Shortest Bridge](problem:shortest-bridge),
   [Jump Game IV](problem:jump-game-iv),
   [Shortest Path with Alternating Colors](problem:shortest-path-with-alternating-colors).
   BFS where the hard part is deciding what a state is. The first wants a flood
   fill and then a multi-source start; the second wants the value-to-indices map
   cleared after use, or it is quadratic.
6. [Shortest Path in a Grid with Obstacles Elimination](problem:shortest-path-in-a-grid-with-obstacles-elimination),
   [Shortest Path to Get All Keys](problem:shortest-path-to-get-all-keys). The
   state gains a dimension — how many walls you have broken, which keys you
   hold. Once \`seen\` is indexed by the full state these are the same loop again.
7. [Sliding Window Maximum](problem:sliding-window-maximum),
   [Jump Game VI](problem:jump-game-vi),
   [Constrained Subsequence Sum](problem:constrained-subsequence-sum). The
   monotonic queue, which needs both ends and so belongs to
   [deque](#/dsa/deque/notes). Read that page first, then come back for these.
`;export{e as default};