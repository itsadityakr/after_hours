var e=`These are the shortest solutions on the sheet. Sort the input, walk it once, take
whatever looks best at each step, never reconsider. Ten lines, no recursion, no
table, no extra memory. That is the appeal, and it is also the trap: the code is
easy to write and hard to justify, and a rule that is wrong is wrong
silently. It compiles, it runs, it passes the three examples in the question, and
it fails on a case you did not think of.

So this page is mostly not about writing greedy code. It is about **how to know
the rule is safe** before you commit to it. There are two tools. One is a proof
technique — the exchange argument — which is short enough to say out loud in an
interview. The other is the habit of spending sixty seconds actively trying to
break your own rule on a tiny input, which catches more mistakes than the proof
does.

When neither works — when you cannot argue the rule is safe and cannot find a
counter-example either — the honest answer is that the problem probably wants
[dynamic programming](#/dsa/dynamic-programming/notes) instead. Greedy commits to
one choice per step; DP keeps all of them. That is the entire difference, and
knowing which of the two a problem needs is the skill this topic is really
training.

## What a greedy choice is

An optimisation problem asks for the best of many possible arrangements. The
brute force tries all of them, which for n items is usually 2ⁿ or n! and hopeless
past about twenty.

A greedy algorithm replaces "try all arrangements" with a **rule applied once per
step**: at each point, look only at what is in front of you, pick the option that
looks best by some simple measure, and never revisit it. No branching, no undo.

\`\`\`java
Arrays.sort(items, byBestFirst);
for (T item : items) if (fits(item)) take(item);
\`\`\`

That is the whole shape. The interesting part is \`byBestFirst\` — the measure. For
one problem it is the earliest finishing time, for another the largest value per
kilogram, for another the smallest count. Choosing the measure is the design, and
choosing it wrongly is the failure mode.

## The two properties it needs

A greedy rule is correct when the problem has both of these. If you can state
them for your rule, you can state the argument.

**Greedy choice property.** There is an optimal solution that contains the choice
your rule makes first. Not "your rule makes the only optimal choice" — that is
usually false, since ties exist. The claim is that taking your choice never rules
out reaching an optimal answer.

**Optimal substructure.** After making that choice, what remains is the same kind
of problem on a smaller input, and the best answer overall is your choice plus
the best answer to the remainder. This is the property greedy shares with
divide-and-conquer and with DP; it is the greedy choice property that is special.

Both matter. Coin change has optimal substructure — the best way to make 6p is
one coin plus the best way to make what is left — and, for some coin sets, no
greedy choice property. That is exactly why it needs DP.

## The exchange argument

This is the standard way to prove the greedy choice property, and it is worth
writing out once in full so you can reproduce the shape for other problems.

The problem: given intervals with a start and an end, choose as many as possible
that do not overlap. This is [Non-overlapping Intervals](problem:non-overlapping-intervals)
turned round — the question asks for the fewest removals, which is n minus the
most you can keep.

The rule: **sort by end time, and take an interval whenever it starts at or after
the last one you took ended.**

The argument, in five sentences.

1. Let \`G = g₁, g₂, …\` be what the rule takes, in order. Let \`O = o₁, o₂, …\` be
   any optimal answer, also sorted by end time.
2. Suppose the two agree on the first i − 1 choices and differ at position i.
3. Both \`gᵢ\` and \`oᵢ\` are compatible with that shared prefix. The rule picks the
   compatible interval with the earliest end, so \`end(gᵢ) ≤ end(oᵢ)\`.
4. Swap \`oᵢ\` out of \`O\` and \`gᵢ\` in. Everything after \`oᵢ\` in \`O\` starts at or
   after \`end(oᵢ)\`, which is at or after \`end(gᵢ)\`, so nothing overlaps and the
   set is still valid — and still the same size, so still optimal.
5. Each swap makes \`O\` agree with \`G\` on one more choice, and there are finitely
   many, so repeating turns \`O\` into \`G\` without ever shrinking it. Therefore \`G\`
   is optimal.

The shape generalises. Take any optimal answer, find the first place it differs
from yours, show you can exchange its choice for yours without making it worse,
and conclude by repetition. If you cannot get step 4 to work — if the swap breaks
something — that failure usually points straight at a counter-example.

\`\`\`text
[1,3] [2,4] [3,5] [0,7]

sorted by end:  [1,3] [2,4] [3,5] [0,7]

take [1,3]      lastEnd = 3
[2,4] starts 2 < 3   overlap, skip
[3,5] starts 3 >= 3  take, lastEnd = 5
[0,7] starts 0 < 5   overlap, skip

kept 2, so removals = 4 - 2 = 2
\`\`\`

## The counter-example habit

Before trusting a rule, spend a minute trying to break it. Small inputs, three or
four items, chosen to be awkward. Two rules that feel just as reasonable as
"earliest end" for the interval problem, and are both wrong:

\`\`\`text
"earliest start"     [0,10] [1,2] [3,4]
                     takes [0,10] and stops.  1 kept, best is 2.

"shortest interval"  [0,5] [4,6] [6,10]
                     takes [4,6], which collides with both others.
                     1 kept, best is 2 — namely [0,5] and [6,10].
\`\`\`

Neither is exotic. Both are three intervals you could have written down in
fifteen seconds. That is the point: the counter-examples for a wrong greedy rule
are almost always tiny, so the search is cheap and it is worth doing every single
time before you write the loop.

## When greedy fails: coin change

[Coin Change](problem:coin-change) is the canonical failure, and it is worth
seeing rather than being told.

Make an amount using the fewest coins from a given set. The greedy rule — take
the largest coin that still fits, repeatedly — is what a shopkeeper does, and for
British or American coins it is optimal. Change the coin set to \`{1, 3, 4}\` and
ask for 6, and it takes 4, then 1, then 1: three coins. Two threes would have
done it.

Nothing about the code is wrong. The rule is wrong, and it is wrong because the
greedy choice property does not hold for that coin set: no optimal answer for 6
contains a 4. The fix is not a better rule. It is to stop committing and let
every amount consider every coin, which is DP.

\`\`\`java Coins.java @run-greedy-coins
import java.util.Arrays;

public class Coins {

    /** Take the largest coin that still fits, over and over. */
    static int greedy(int[] coins, int amount) {
        int[] sorted = coins.clone();
        Arrays.sort(sorted);
        int used = 0;
        for (int i = sorted.length - 1; i >= 0; i--)
            while (amount >= sorted[i]) { amount -= sorted[i]; used++; }
        return amount == 0 ? used : -1;    // it can get stuck and give up
    }

    /** Every amount from 0 upwards, each built from the best smaller answer. */
    static int dp(int[] coins, int amount) {
        int[] best = new int[amount + 1];
        Arrays.fill(best, Integer.MAX_VALUE);
        best[0] = 0;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a && best[a - c] != Integer.MAX_VALUE)
                    best[a] = Math.min(best[a], best[a - c] + 1);
        return best[amount] == Integer.MAX_VALUE ? -1 : best[amount];
    }

    static void compare(int[] coins, int amount) {
        int g = greedy(coins, amount), d = dp(coins, amount);
        System.out.printf("coins %-12s amount %2d   greedy %2d   dp %2d   %s%n",
                Arrays.toString(coins), amount, g, d, g == d ? "agree" : "GREEDY IS WRONG");
    }

    public static void main(String[] args) {
        compare(new int[] { 1, 2, 5, 10, 20, 50 }, 63);   // ordinary coins, fine
        compare(new int[] { 1, 5, 10, 25 }, 30);          // also fine
        compare(new int[] { 1, 3, 4 }, 6);                // 4+1+1 against 3+3
        compare(new int[] { 3, 4 }, 6);                   // greedy gets stuck entirely
    }
}
\`\`\`

\`\`\`output @run-greedy-coins
coins [1, 2, 5, 10, 20, 50] amount 63   greedy  4   dp  4   agree
coins [1, 5, 10, 25] amount 30   greedy  2   dp  2   agree
coins [1, 3, 4]    amount  6   greedy  3   dp  2   GREEDY IS WRONG
coins [3, 4]       amount  6   greedy -1   dp  2   GREEDY IS WRONG
\`\`\`

The last line is the sharper failure. With coins \`{3, 4}\` and amount 6, greedy
takes the 4, cannot make 2 out of what is left, and reports that it is
impossible. Two threes exist. A greedy rule does not merely give a worse answer —
it can give no answer at all.

## Sort, then scan

Most of the easy and medium band is one shape: sort by the right key, walk once,
keep a single running variable. The link to [sorting](#/dsa/sorting/notes) is not
incidental — choosing the comparator *is* choosing the greedy rule.

[Assign Cookies](problem:assign-cookies) is the smallest honest example. Children
have a greed factor, cookies have a size, and a child is content if the cookie is
at least as big as their greed. Maximise the number of content children.

Sort both. Walk the cookies, and give the current cookie to the hungriest child
it can satisfy — which, walking children in increasing greed, means the child
your pointer is on. The exchange argument: if an optimal answer gives some larger
cookie to that child instead, swap it for yours; the larger cookie is still big
enough for whoever had it, so nothing breaks.

\`\`\`java Scan.java @run-greedy-scan
import java.util.Arrays;

public class Scan {

    /** The most non-overlapping intervals you can keep. Sort by end. */
    static int keepMost(int[][] intervals) {
        Arrays.sort(intervals, (x, y) -> Integer.compare(x[1], y[1]));
        int kept = 0, lastEnd = Integer.MIN_VALUE;
        for (int[] in : intervals)
            if (in[0] >= lastEnd) { kept++; lastEnd = in[1]; }
        return kept;
    }

    /** Content children, given greed factors and cookie sizes. */
    static int contentChildren(int[] greed, int[] cookies) {
        Arrays.sort(greed);
        Arrays.sort(cookies);
        int child = 0;
        for (int c = 0; c < cookies.length && child < greed.length; c++)
            if (cookies[c] >= greed[child]) child++;    // this child is served
        return child;
    }

    /** Every upward step taken. Sum of all rises is the most you can make. */
    static int stockProfit(int[] prices) {
        int total = 0;
        for (int i = 1; i < prices.length; i++)
            if (prices[i] > prices[i - 1]) total += prices[i] - prices[i - 1];
        return total;
    }

    public static void main(String[] args) {
        int[][] intervals = { { 1, 3 }, { 2, 4 }, { 3, 5 }, { 0, 7 } };
        int kept = keepMost(intervals);
        System.out.println("intervals kept " + kept + ", removals " + (intervals.length - kept));

        int[][] chained = { { 1, 2 }, { 2, 3 }, { 3, 4 } };
        System.out.println("touching ends  " + keepMost(chained) + " kept, none removed");

        System.out.println("cookies  " + contentChildren(new int[] { 1, 2, 3 }, new int[] { 1, 1 }));
        System.out.println("cookies  " + contentChildren(new int[] { 1, 2 }, new int[] { 1, 2, 3 }));

        System.out.println("profit   " + stockProfit(new int[] { 7, 1, 5, 3, 6, 4 }));
        System.out.println("profit   " + stockProfit(new int[] { 7, 6, 4, 3, 1 }) + "  never rises");
    }
}
\`\`\`

\`\`\`output @run-greedy-scan
intervals kept 2, removals 2
touching ends  3 kept, none removed
cookies  1
cookies  2
profit   7
profit   0  never rises
\`\`\`

\`stockProfit\` is [Best Time to Buy and Sell Stock II](problem:best-time-to-buy-and-sell-stock-ii),
and it is the greedy rule most people distrust on sight: sum every single upward
step. The argument is that any profitable multi-day hold decomposes into
consecutive daily steps, and taking all the positive steps while skipping the
negative ones is at least as good as any subset of holds. Unlimited transactions
is what makes it safe — with a limit, the problem becomes DP.

## Reachability: jump game, and gas station

A second family, where nothing is sorted and the greedy variable is *how far you
can get*.

[Jump Game](problem:jump-game): each entry is the maximum jump length from that
index. Can you reach the end? Carry \`furthest\`, the rightmost index reachable so
far. At index \`i\`, if \`i > furthest\` you are standing beyond anything reachable
and the answer is no. Otherwise stretch \`furthest\` to \`max(furthest, i + a[i])\`.

[Jump Game II](problem:jump-game-ii) wants the fewest jumps, which is the same
scan with the array cut into levels: everything reachable in one jump, then
everything reachable in two, and so on. When \`i\` reaches the end of the current
level, the jump count goes up and the level end moves to \`furthest\`. That is
breadth-first search written without a queue.

[Gas Station](problem:gas-station) is the one that looks like it needs a nested
loop over starting points. It does not, because of one observation: **if you run
out of fuel somewhere between station s and station j, then no station in between
works as a start either.** Any of them would have begun with less fuel in the
tank than a run from s would have carried in. So when the tank goes negative,
throw away every candidate up to and including the current station, reset the
tank, and carry on from the next. One pass. And if the total gas is at least the
total cost, a solution exists — that is the feasibility check the loop needs
separately from the search.

\`\`\`java Reach.java @run-greedy-reach
public class Reach {

    /** Can you get from index 0 to the last index? */
    static boolean canJump(int[] a) {
        int furthest = 0;
        for (int i = 0; i < a.length; i++) {
            if (i > furthest) return false;            // stranded before here
            furthest = Math.max(furthest, i + a[i]);
        }
        return true;
    }

    /** The fewest jumps to reach the end. Levels, like a breadth-first search. */
    static int minJumps(int[] a) {
        int jumps = 0, levelEnd = 0, furthest = 0;
        for (int i = 0; i < a.length - 1; i++) {
            furthest = Math.max(furthest, i + a[i]);
            if (i == levelEnd) { jumps++; levelEnd = furthest; }
        }
        return jumps;
    }

    /** The station you can start from and get all the way round, or -1. */
    static int startStation(int[] gas, int[] cost) {
        int total = 0, tank = 0, start = 0;
        for (int i = 0; i < gas.length; i++) {
            int step = gas[i] - cost[i];
            total += step;
            tank += step;
            if (tank < 0) { start = i + 1; tank = 0; }   // nothing before here works
        }
        return total >= 0 ? start : -1;
    }

    public static void main(String[] args) {
        System.out.println("canJump  " + canJump(new int[] { 2, 3, 1, 1, 4 }));
        System.out.println("canJump  " + canJump(new int[] { 3, 2, 1, 0, 4 }) + "   the 0 strands you");
        System.out.println("canJump  " + canJump(new int[] { 0 }) + "    already at the end");

        System.out.println("minJumps " + minJumps(new int[] { 2, 3, 1, 1, 4 }));
        System.out.println("minJumps " + minJumps(new int[] { 1, 1, 1, 1 }));

        System.out.println("start    " + startStation(new int[] { 1, 2, 3, 4, 5 },
                                                      new int[] { 3, 4, 5, 1, 2 }));
        System.out.println("start    " + startStation(new int[] { 2, 3, 4 },
                                                      new int[] { 3, 4, 3 }) + "   impossible");
    }
}
\`\`\`

\`\`\`output @run-greedy-reach
canJump  true
canJump  false   the 0 strands you
canJump  true    already at the end
minJumps 2
minJumps 3
start    3
start    -1   impossible
\`\`\`

## The heap kind: take the two smallest, repeatedly

Not every greedy rule can be settled by one sort, because the thing you want next
depends on choices already made. When the rule is "always act on the current
smallest", the structure is a [heap](#/dsa/heaps/notes).

The model is Huffman coding, and
[Minimum Cost to Connect Sticks](problem:minimum-cost-to-connect-sticks) is the
same algorithm with the encoding stripped out. Joining two sticks costs the sum
of their lengths, and the joined stick goes back in the pile. Minimise the total
cost.

The rule: repeatedly take the two shortest sticks and join them. The reason is
that every join adds its result into some later join, so a stick joined early is
paid for again and again — early joins should therefore be the cheap ones. The
exchange argument runs: in any optimal solution, the two sticks joined deepest
can be swapped for the two smallest without increasing the total.

A \`PriorityQueue\` is a min-heap by default, so this is six lines.

\`\`\`java Sticks.java @run-greedy-sticks
import java.util.PriorityQueue;

public class Sticks {

    /** Join the two shortest, put the result back, repeat. */
    static int connectCost(int[] lengths) {
        PriorityQueue<Integer> heap = new PriorityQueue<>();
        for (int len : lengths) heap.add(len);

        int total = 0;
        while (heap.size() > 1) {
            int joined = heap.poll() + heap.poll();   // the two smallest
            total += joined;
            heap.add(joined);
        }
        return total;
    }

    /**
     * Task Scheduler. With a cooling gap of n between equal tasks, arrange the
     * most frequent task first and slot the rest into its gaps.
     */
    static int schedule(char[] tasks, int gap) {
        int[] count = new int[26];
        for (char t : tasks) count[t - 'A']++;

        int most = 0, tied = 0;
        for (int c : count) most = Math.max(most, c);
        for (int c : count) if (c == most) tied++;

        // (most - 1) full frames of width gap + 1, then the final tied tasks
        int frames = (most - 1) * (gap + 1) + tied;
        return Math.max(tasks.length, frames);
    }

    public static void main(String[] args) {
        System.out.println("connect  " + connectCost(new int[] { 2, 4, 3 }));
        System.out.println("connect  " + connectCost(new int[] { 1, 8, 3, 5 }));
        System.out.println("connect  " + connectCost(new int[] { 5 }) + "   nothing to join");

        System.out.println("schedule " + schedule("AAABBB".toCharArray(), 2));
        System.out.println("schedule " + schedule("AAABBB".toCharArray(), 0) + "   no cooling");
        System.out.println("schedule " + schedule("AAAAAABCDEFG".toCharArray(), 2));
    }
}
\`\`\`

\`\`\`output @run-greedy-sticks
connect  14
connect  30
connect  0   nothing to join
schedule 8
schedule 6   no cooling
schedule 16
\`\`\`

[Task Scheduler](problem:task-scheduler) is worth a second look because the
greedy choice is not in a loop at all — it is in the counting. Lay out the most
frequent task with \`gap\` slots after each occurrence, which gives \`most - 1\`
frames of width \`gap + 1\`, plus the final occurrences of every task tied for most
frequent. Every other task fits into the gaps. If there are more tasks than slots
in that layout there are no idle slots at all, which is why the answer is the
larger of the frame count and \`tasks.length\`.

## What it costs

| Form | Time | Space |
|---|---|---|
| Sort, then one scan | O(n log n) | O(1) beyond the sort |
| Scan with a running maximum | O(n) | O(1) |
| Counting, then a formula | O(n + k) | O(k) for the counts |
| Repeated extract-two-smallest | O(n log n) | O(n) for the heap |

The sort dominates almost every greedy solution, so the honest summary of the
topic is O(n log n) and the scan is free. When there is no sort — the jump and
gas station family — it is O(n) with O(1) extra memory, which is as good as these
problems get and is the reason interviewers like them.

The cost that is not in the table is the proof. It costs a minute of thinking and
it is the only part that can be wrong.

## The mistakes, in the order people make them

1. **Trusting the rule because the examples pass.** Three examples is not
   evidence. Try to break it on four items of your own choosing.
2. **Sorting by the wrong key.** For interval scheduling, start time and duration
   both feel reasonable and both lose. Say which key and why.
3. **Subtracting inside a comparator.** \`(x, y) -> x[1] - y[1]\` overflows for
   large values and silently sorts wrongly. \`Integer.compare(x[1], y[1])\`.
4. **Reaching for greedy when the problem allows a trade.** If taking the best
   item now can make two later items unavailable, you are probably in DP
   territory — knapsack is the standard example.
5. **Getting the boundary wrong on intervals.** Is \`[1,2]\` and \`[2,3]\` an
   overlap? Read the question. It changes \`>=\` to \`>\` and it changes the answer.
6. **Forgetting the feasibility check.** Gas station needs total gas at least
   total cost; the scan alone finds a candidate start but does not prove one
   exists.
7. **Not handling an empty or single-element input.** A heap loop on one stick
   must join nothing and cost nothing.
8. **Confusing "greedy is wrong" with "greedy is slow".** When greedy fails it
   returns the wrong answer at full speed. There is no warning.

## The Java you will reach for

| You want | Write |
|---|---|
| Sort an \`int[][]\` by a column | \`Arrays.sort(a, (x, y) -> Integer.compare(x[0], y[0]))\` |
| Two keys, one descending | \`Comparator.comparingInt(A::f).thenComparing(A::g, Comparator.reverseOrder())\` |
| A min-heap | \`new PriorityQueue<>()\` |
| A max-heap | \`new PriorityQueue<>(Comparator.reverseOrder())\` |
| Take and remove the smallest | \`heap.poll()\` — \`peek\` looks without removing |
| Counts over letters | \`int[] count = new int[26]; count[c - 'A']++\` |
| Running best | \`best = Math.max(best, candidate)\` |
| Sort a \`List\` in place | \`list.sort(comparator)\` |
| Descending \`Integer[]\` | \`Arrays.sort(boxed, Collections.reverseOrder())\` |

\`Arrays.sort\` on primitives has no comparator overload — sorting \`int[]\`
descending means boxing to \`Integer[]\`, or sorting ascending and walking
backwards. The second is usually what you want.

## Working one from the sheet

[Jump Game II](problem:jump-game-ii): the fewest jumps from index 0 to the last
index, given that \`a[i]\` is the furthest you may jump from \`i\`.

The DP answer is straightforward and O(n²): the cost to reach \`j\` is one more
than the cheapest reachable \`i\`. The greedy answer is O(n), and the argument is
the level idea above. Everything reachable in one jump forms an interval
\`[1, a[0]]\`. While scanning that interval you compute the furthest point
reachable from anywhere inside it, and that becomes the two-jump interval. Since
the intervals only ever move right and each index is scanned once, the count you
end with is the smallest possible — an index in the k-th interval genuinely
cannot be reached in fewer than k jumps.

\`\`\`text
a = [2, 3, 1, 1, 4]

i=0  furthest = 0+2 = 2      i == levelEnd(0)  -> jumps = 1, levelEnd = 2
i=1  furthest = max(2, 1+3) = 4
i=2  furthest = max(4, 2+1) = 4   i == levelEnd(2) -> jumps = 2, levelEnd = 4
i=3  loop stops at length-1

answer 2
\`\`\`

The loop stops at \`a.length - 1\`, not at \`a.length\`. Reaching the last index is
arrival; counting a jump from it would add one too many. That single bound is the
most common bug in this problem, and it is why the trace above is worth writing
before the code.

## How to work through the topic

1. [Assign Cookies](problem:assign-cookies) and
   [Lemonade Change](problem:lemonade-change). Sort, or count, then one pass.
   For each, say the exchange argument out loud before writing anything.
2. [Best Time to Buy and Sell Stock II](problem:best-time-to-buy-and-sell-stock-ii)
   and [Maximum Units on a Truck](problem:maximum-units-on-a-truck). Two rules
   you would not trust on sight. Convince yourself, then check.
3. [Jump Game](problem:jump-game) and [Jump Game II](problem:jump-game-ii). The
   reachability family. \`furthest\`, then levels.
4. [Gas Station](problem:gas-station) and
   [Largest Perimeter Triangle](problem:largest-perimeter-triangle). Both hinge
   on one observation that removes a nested loop. Find the observation first.
5. [Non-overlapping Intervals](problem:non-overlapping-intervals) and
   [Minimum Number of Arrows to Burst Balloons](problem:minimum-number-of-arrows-to-burst-balloons).
   The exchange argument in full. Then read
   [intervals](#/dsa/intervals/notes) — sorting by end time is the whole topic.
6. [Task Scheduler](problem:task-scheduler) and
   [Hand of Straights](problem:hand-of-straights). Counting first and arranging
   second, with a heap or a \`TreeMap\` for the ordered counts.
7. [Candy](problem:candy), [IPO](problem:ipo) and
   [Remove Duplicate Letters](problem:remove-duplicate-letters). Two passes in
   opposite directions, a heap fed by a sorted scan, and a greedy rule enforced
   with a monotonic stack. Leave
   [Minimum Cost to Hire K Workers](problem:minimum-cost-to-hire-k-workers) and
   [Create Maximum Number](problem:create-maximum-number) until last — both need
   a proof you would not guess.
`;export{e as default};