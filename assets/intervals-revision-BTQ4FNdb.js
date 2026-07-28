var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## Decide this before writing anything

- **Do \`[1,2]\` and \`[2,3]\` overlap?** Closed intervals say yes, half-open say no.
  The problem statement tells you, in one clause you will read past.
- Closed: overlap when \`b.start <= a.end\`. Half-open: \`b.start < a.end\`.
- Symmetric form, closed: \`Math.max(a[0], b[0]) <= Math.min(a[1], b[1])\`. Those
  same two values are the intersection.
- One character decides it, and it is the most common wrong answer here.

## Sort by start, or sort by end

| The question | Sort by |
|---|---|
| Merge overlapping, describe the union | start |
| Insert into, or intersect, a sorted list | already start |
| Keep the most non-overlapping, fewest removals | end |
| Fewest arrows, fewest platforms | end |
| How many overlap at once | neither — sweep the events |
| Depth, with times bounded and small | neither — difference array |

- Choose a **subset**: sort by end. Describe the **union**: sort by start. Ask
  **how deep**: forget the intervals, sweep the events.

## Merging

\`\`\`java
Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]));
for (int[] cur : iv) {
    int[] last = out.isEmpty() ? null : out.get(out.size() - 1);
    if (last != null && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);
    else out.add(new int[] { cur[0], cur[1] });
}
\`\`\`

- Start order means anything that overlaps the output must overlap the **last**
  entry. No search — just look at the back.
- \`Math.max\` matters: without it a fully nested \`[2,3]\` shrinks \`[1,10]\` to
  \`[1,3]\`.

## Inserting, in three phases

1. **Before** — \`while (iv[i][1] < add[0])\` copy across untouched.
2. **Merging** — \`while (iv[i][0] <= e)\` widen \`s = min(s, iv[i][0])\`,
   \`e = max(e, iv[i][1])\`, emit nothing. Emit the widened interval once at the end.
3. **After** — copy the rest.

O(n), because the list was already sorted and no phase revisits anything.

## The end-sorted greedy

\`\`\`java
Arrays.sort(iv, (x, y) -> Integer.compare(x[1], y[1]));   // by END
int kept = 0;
long lastEnd = Long.MIN_VALUE;
for (int[] cur : iv)
    if (cur[0] >= lastEnd) { kept++; lastEnd = cur[1]; }
return iv.length - kept;                                  // removals
\`\`\`

- **Exchange argument**: let \`g\` finish earliest and \`O\` be any optimal set with
  first element \`o\`. Since \`g.end ≤ o.end\`, swapping \`g\` in for \`o\` conflicts
  with nothing later, and \`O\` stays the same size. So some optimal set contains
  the greedy pick. Induct.
- Sorting by **start** fails: \`[1,100]\` starts first and blocks \`[2,3]\`, \`[4,5]\`,
  \`[6,7]\`. Starting early says nothing about the room left after.
- Arrows use \`>\` not \`>=\`, because touching balloons burst together. Same code,
  one character.
- \`lastEnd\` as a \`long\` — an \`int\` sentinel is a legal end time.

## Counting depth

- **Sweep line**: every interval becomes \`(start, +1)\` and \`(end, -1)\`. Sort all
  2n events, carry a running count, take its maximum.
- Tiebreak at equal times: \`-1\` before \`+1\` for half-open (a room freed at 10 is
  reused at 10); \`+1\` first for closed.
- **Difference array**: when times are small, \`delta[start] += 1\`,
  \`delta[end] -= 1\`, then prefix-sum. O(n + range), no sort. Read the constraints
  — \`0 ≤ t ≤ 1000\` is the problem telling you to use it.
- **Min-heap of end times**: sort by start; if \`endings.peek() <= cur.start\`
  poll it, then offer \`cur.end\`. The final \`endings.size()\` is the answer. Only
  the earliest-freeing room is worth checking — see [heaps](#/dsa/heaps/notes).

## The bugs

- Not settling the convention first.
- Sorting by start for the keep-the-most greedy.
- \`last.end = cur.end\` instead of \`max\` — nesting shrinks the output.
- \`(x, y) -> x[0] - y[0]\` overflows. Use \`Integer.compare\`.
- No guard for the empty list, or for one interval.
- Putting the caller's row into your output and then mutating it. Copy it.
- Sweep tiebreak backwards, so touching intervals count as two.
- Difference array on a 10⁹ time axis.
- Assuming the input is sorted. Only Insert Interval and Interval List
  Intersections promise it.

## The API

| Want | Write |
|---|---|
| Sort by start / by end | \`Arrays.sort(iv, (x, y) -> Integer.compare(x[0], y[0]))\` — \`x[1]\` for end |
| Look at the last kept | \`out.get(out.size() - 1)\` |
| Back to an array | \`out.toArray(new int[0][])\` |
| Widen | \`last[1] = Math.max(last[1], cur[1])\` |
| Intersection | \`new int[]{ Math.max(a[0], b[0]), Math.min(a[1], b[1]) }\` |
| Copy a row | \`p.clone()\` |

## Worth remembering

- The sort is O(n log n) and dominates. Nothing beats it unless times are bounded.
- \`Arrays.sort\` on objects is stable, so equal keys keep input order.
- [Employee Free Time](problem:employee-free-time) is Merge Intervals plus the
  complement — gap problems are a merge pass and a subtraction.
- The greedy is the one from [greedy](#/dsa/greedy/notes); the comparator is the
  skill from [sorting](#/dsa/sorting/notes).
`;export{e as default};