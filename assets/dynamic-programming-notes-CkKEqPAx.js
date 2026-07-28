var e=`The name is off-putting and the idea is not. It is one thing: a recursion whose
subproblems keep coming back, and a place to write each answer down so you only
ever work it out once. That is the whole of it. Everything that looks difficult —
the tables, the two-dimensional grids, the backwards loops — is bookkeeping laid
on top of a recursion you could have written yourself.

The brute force it replaces is exponential. Counting the ways up a staircase by
trying every sequence of steps takes O(2ⁿ) calls; writing down the answer for
each step count takes O(n). Nothing about the logic changes between those two
programs. Only the remembering does.

The difficulty is real, but it is not the table. It is naming the **state** — the
few numbers that say where you are, so that everything still to be decided
depends on those and nothing else. Get the state right and the recurrence
usually writes itself. Get it wrong and no amount of table-filling will save you.

## What makes a problem a DP problem

Two properties, and a problem needs both.

- **Overlapping subproblems.** The same smaller question is asked many times. In
  the staircase recursion, \`f(n - 2)\` is computed by \`f(n)\` and again by
  \`f(n - 1)\`, and so on all the way down, which is where the exponential goes.
- **Optimal substructure.** The best answer for the whole is built from the best
  answers for the parts. The cheapest path to the bottom-right cell is the
  cheaper of the two cells above and to the left, plus this cell.

Sorting has neither and merge sort is not DP: its subproblems never repeat. A
[greedy](#/dsa/greedy/notes) algorithm has the second without needing the first —
it commits to one choice and never revisits it, which is faster when it works
and silently wrong when it does not. DP is what you use when you cannot prove a
greedy choice is safe: it tries every choice and keeps the best.

If you can write a recursion for the problem, you are most of the way there. If
that recursion is slow because it recomputes, it is a DP problem.

## The route that always works

Never start by writing a table. Start with the recursion, then make it remember,
then, if you want, turn it inside out. Here is
[Climbing Stairs](problem:climbing-stairs) — you climb 1 or 2 steps at a time,
how many ways to reach step n — at each of those four stages.

\`\`\`text
f(5) = f(4) + f(3)
       |       |
       |       +-- f(2) + f(1)
       +-- f(3) + f(2)
            |
            +-- f(2) + f(1)      <- f(3) computed twice, f(2) three times

The same nodes reappear across the tree. That repetition is the whole cost,
and a table with one cell per n is the whole fix.
\`\`\`

\`\`\`java Derive.java @run-dynamic-programming-derive
public class Derive {

    static long calls;

    /** 1. The recursion straight from the description. Correct, and exponential. */
    static int slow(int n) {
        calls++;
        if (n <= 1) return 1;
        return slow(n - 1) + slow(n - 2);
    }

    /** 2. The same recursion, with each answer written down the first time. */
    static int memo(int n, int[] cache) {
        if (n <= 1) return 1;
        if (cache[n] != 0) return cache[n];        // already worked out
        return cache[n] = memo(n - 1, cache) + memo(n - 2, cache);
    }

    /** 3. Turned inside out: smallest first, so nothing has to recurse. */
    static int table(int n) {
        if (n <= 1) return 1;
        int[] dp = new int[n + 1];
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp[n];
    }

    /** 4. Only two cells are ever read, so two variables will do. */
    static int rolling(int n) {
        int prev = 1, cur = 1;
        for (int i = 2; i <= n; i++) {
            int next = prev + cur;
            prev = cur;
            cur = next;
        }
        return cur;
    }

    public static void main(String[] args) {
        calls = 0;
        System.out.println("slow(20)    = " + slow(20) + "  in " + calls + " calls");
        calls = 0;
        System.out.println("slow(30)    = " + slow(30) + "  in " + calls + " calls");
        System.out.println("memo(30)    = " + memo(30, new int[31]));
        System.out.println("table(30)   = " + table(30));
        System.out.println("rolling(45) = " + rolling(45));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-derive
slow(20)    = 10946  in 21891 calls
slow(30)    = 1346269  in 2692537 calls
memo(30)    = 1346269
table(30)   = 1346269
rolling(45) = 1836311903
\`\`\`

Look at the call counts. Ten more steps multiply the work by more than a hundred,
and by n = 50 the brute force would still be running tomorrow — while \`memo\` and
\`table\` do thirty units of work each. All four functions return the same number,
because they are the same recursion.

The three forms have names. Stage 2 is **top-down**, or memoisation: you still
start at the answer and ask downwards, but a cache catches the repeats. Stage 3
is **bottom-up**, or tabulation: you fill the smallest subproblem first and work
upwards until the answer is the last cell you wrote. The order is exactly the
reverse of the recursion, which is why every bottom-up loop is somebody's
recursion turned around.

Do this on paper every time. The recursion is where the thinking happens; the
table is a transcription.

## Finding the state

The state is the answer to one question: **what would I need to know to decide
everything that is left?** Not what has happened, only what still matters.

A quick test that always works: write the brute-force recursion first, then look
at its parameters. Whatever varies between calls is the state. Whatever is the
same in every call — the input array, the target — is not state; it is just data.

| Problem | What varies | The state | Meaning of the cell |
|---|---|---|---|
| Climbing Stairs | the step you are on | \`i\` | ways to reach step \`i\` |
| House Robber | the house, whether the last was robbed | \`i\` | best takings from the first \`i\` |
| Coin Change | the amount left | \`amount\` | fewest coins making \`amount\` |
| 0/1 Knapsack | item index, capacity left | \`i, cap\` | best value from items \`0..i\` in \`cap\` |
| Edit Distance | how far into each string | \`i, j\` | edits turning \`a[0..i)\` into \`b[0..j)\` |
| Best Time to Buy and Sell Stock III | day, trades used, holding or not | \`i, k, held\` | best cash in that situation |

Say the meaning of one cell in a full sentence before writing any code — "\`dp[i]\`
is the largest sum you can take from the first \`i\` houses". If you cannot finish
that sentence, you do not have the state yet, and the recurrence will not come.

Two more habits worth forming. The number of states times the work per state is
the running time, so you can price a design before you write it. And if the state
has too many dimensions to fit the constraints, that is the signal to look for
something you are carrying that does not actually matter.

## Linear DP: one index

The smallest family. One index walks the input, and each cell depends on a fixed
number of earlier ones.

[House Robber](problem:house-robber): take a house or skip it, but never two in a
row. At house \`i\` you either rob it — adding its value to the best of everything
up to \`i - 2\` — or you skip it and keep the best up to \`i - 1\`. Two candidates,
take the larger.

\`\`\`java Linear.java @run-dynamic-programming-linear
public class Linear {

    /** best over a[from..to], never taking two neighbours. */
    static int robRange(int[] a, int from, int to) {
        int take = 0, skip = 0;              // best ending here robbed / not robbed
        for (int i = from; i <= to; i++) {
            int nextTake = skip + a[i];      // rob this one, so the last was skipped
            skip = Math.max(skip, take);     // skip this one, keep the better of both
            take = nextTake;
        }
        return Math.max(take, skip);
    }

    /** Houses in a circle: the first and the last are neighbours too. */
    static int robCircle(int[] a) {
        if (a.length == 1) return a[0];
        return Math.max(robRange(a, 0, a.length - 2),    // give up the last house
                        robRange(a, 1, a.length - 1));   // give up the first
    }

    /** Decode ways: 1 = A up to 26 = Z, so "12" is AB or L. */
    static int decodings(String s) {
        if (s.isEmpty() || s.charAt(0) == '0') return 0;
        int prev = 1, cur = 1;               // ways to decode 0 and 1 characters
        for (int i = 1; i < s.length(); i++) {
            int ways = 0;
            if (s.charAt(i) != '0') ways += cur;                  // stands on its own
            int pair = (s.charAt(i - 1) - '0') * 10 + (s.charAt(i) - '0');
            if (pair >= 10 && pair <= 26) ways += prev;           // joins the one before
            prev = cur;
            cur = ways;
        }
        return cur;
    }

    public static void main(String[] args) {
        System.out.println("rob       " + robRange(new int[] { 2, 7, 9, 3, 1 }, 0, 4));
        System.out.println("rob       " + robRange(new int[] { 5 }, 0, 0));
        System.out.println("circle    " + robCircle(new int[] { 2, 3, 2 }));
        System.out.println("decode 12 " + decodings("12"));
        System.out.println("decode 226 " + decodings("226"));
        System.out.println("decode 06 " + decodings("06"));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-linear
rob       12
rob       5
circle    3
decode 12 2
decode 226 3
decode 06 0
\`\`\`

[House Robber II](problem:house-robber-ii) is the trick worth taking away: when a
constraint links the two ends, run the straight version twice with one end
excluded each time. You will meet that move again.

The decode-ways recurrence is the same shape with two conditions instead of none,
and it is a good example of state that is *not* obvious: the answer at \`i\`
depends on whether the digit at \`i\` can stand alone and whether the two digits
ending at \`i\` form a number from 10 to 26. Both are decided locally, which is
what makes the state one number.

Others in the family: [Min Cost Climbing Stairs](problem:min-cost-climbing-stairs),
[N-th Tribonacci Number](problem:n-th-tribonacci-number),
[Best Time to Buy and Sell Stock with Cooldown](problem:best-time-to-buy-and-sell-stock-with-cooldown)
— the last carries a small extra dimension for "holding, sold, or resting", which
is the usual way a linear DP grows.

## The knapsack family

A set of items, a budget, and a question about what fits. It is the family with
the most variants and the most confusion, and it all comes down to two loops and
which way round they go.

\`\`\`java Knap.java @run-dynamic-programming-knap
import java.util.Arrays;

public class Knap {

    /** 0/1 knapsack: each item at most once. dp[c] = best value in capacity c. */
    static int knapsack(int[] weight, int[] value, int cap) {
        int[] dp = new int[cap + 1];
        for (int i = 0; i < weight.length; i++)
            for (int c = cap; c >= weight[i]; c--)         // backwards: item used once
                dp[c] = Math.max(dp[c], dp[c - weight[i]] + value[i]);
        return dp[cap];
    }

    /** Subset sum: the same table with can-I instead of how-good. */
    static boolean subsetSum(int[] a, int target) {
        boolean[] dp = new boolean[target + 1];
        dp[0] = true;                                      // the empty subset makes 0
        for (int v : a)
            for (int t = target; t >= v; t--)
                dp[t] |= dp[t - v];
        return dp[target];
    }

    /** Fewest coins making amount, or -1. Coins repeat, so the loop runs forwards. */
    static int fewestCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);                       // larger than any real answer
        dp[0] = 0;
        for (int c : coins)
            for (int a = c; a <= amount; a++)
                dp[a] = Math.min(dp[a], dp[a - c] + 1);
        return dp[amount] > amount ? -1 : dp[amount];
    }

    /** Coin loop outside: each combination counted once. 1+2 and 2+1 are one way. */
    static int combinations(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int c : coins)
            for (int a = c; a <= amount; a++) dp[a] += dp[a - c];
        return dp[amount];
    }

    /** Amount loop outside: order counts. 1+2 and 2+1 are two ways. */
    static int permutations(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        dp[0] = 1;
        for (int a = 1; a <= amount; a++)
            for (int c : coins)
                if (c <= a) dp[a] += dp[a - c];
        return dp[amount];
    }

    public static void main(String[] args) {
        int[] weight = { 1, 3, 4, 5 }, value = { 1, 4, 5, 7 };
        System.out.println("knapsack cap 7   " + knapsack(weight, value, 7));
        System.out.println("subset sum 11    " + subsetSum(new int[] { 3, 34, 4, 12, 5, 2 }, 11));
        System.out.println("subset sum 30    " + subsetSum(new int[] { 3, 34, 4, 12, 5, 2 }, 30));
        System.out.println("fewest coins 11  " + fewestCoins(new int[] { 1, 2, 5 }, 11));
        System.out.println("fewest coins 3   " + fewestCoins(new int[] { 2 }, 3));
        System.out.println("combinations 4   " + combinations(new int[] { 1, 2, 3 }, 4));
        System.out.println("permutations 4   " + permutations(new int[] { 1, 2, 3 }, 4));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-knap
knapsack cap 7   9
subset sum 11    true
subset sum 30    false
fewest coins 11  3
fewest coins 3   -1
combinations 4   4
permutations 4   7
\`\`\`

The last two functions differ by nothing but the order of two loops, and they
answer different questions. It is worth being able to say why.

| Loop order | Counts | Because |
|---|---|---|
| Coins outside, amount inside | Combinations — 1+2 and 2+1 are one | When amount \`a\` is filled, only coins seen so far exist, so each multiset is built in one fixed coin order |
| Amount outside, coins inside | Permutations — 1+2 and 2+1 are two | Every coin is available at every amount, so each ordering of the same coins is reached separately |

Read those loops as sentences. Coins outside says "having decided how many of
coin 1 to use, now decide coin 2" — a decision per coin, taken once.
[Coin Change](problem:coin-change) asks for the fewest coins, where order cannot
matter, so either order gives the right number; the count versions are where the
distinction bites.

Subset sum is a knapsack whose value equals its weight, and asking whether an
array splits into two equal halves is subset sum for \`total / 2\` — with an
immediate rejection when \`total\` is odd.

## Two sequences, and the grid

When the input is two strings or two arrays, the state is usually one index into
each: \`dp[i][j]\` is the answer for the first \`i\` of one and the first \`j\` of the
other. That is a grid, and it is worth drawing.

[Longest Common Subsequence](problem:longest-common-subsequence) of \`abcde\` and
\`ace\`. If the two characters match, they can both be used, so the cell is the
diagonal plus one. If they do not, drop one character from one side or the other
and take the better.

\`\`\`text
          ""   a   c   e
     ""    0   0   0   0
     a     0   1   1   1        match: diagonal + 1
     b     0   1   1   1        no match: max(above, left)
     c     0   1   2   2
     d     0   1   2   2
     e     0   1   2   3   <- the answer, bottom right
\`\`\`

The row and column of zeroes for the empty prefixes are not decoration. They
remove every special case at \`i = 0\` or \`j = 0\`, which is why the table is sized
\`(n + 1) × (m + 1)\` and why \`a.charAt(i - 1)\` is the character the row stands for.

\`\`\`java TwoSeq.java @run-dynamic-programming-two-seq
public class TwoSeq {

    static int[][] lcsTable(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 1; i <= a.length(); i++)
            for (int j = 1; j <= b.length(); j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1] + 1
                        : Math.max(dp[i - 1][j], dp[i][j - 1]);
        return dp;
    }

    /** Walk the finished table backwards to recover the subsequence itself. */
    static String lcsString(String a, String b) {
        int[][] dp = lcsTable(a, b);
        StringBuilder sb = new StringBuilder();
        int i = a.length(), j = b.length();
        while (i > 0 && j > 0) {
            if (a.charAt(i - 1) == b.charAt(j - 1)) {
                sb.append(a.charAt(i - 1));          // this character was used
                i--;
                j--;
            } else if (dp[i - 1][j] >= dp[i][j - 1]) {
                i--;                                 // the answer came from above
            } else {
                j--;                                 // the answer came from the left
            }
        }
        return sb.reverse().toString();
    }

    /** Edit distance: insert, delete or replace, cheapest total. */
    static int editDistance(String a, String b) {
        int n = a.length(), m = b.length();
        int[][] dp = new int[n + 1][m + 1];
        for (int i = 0; i <= n; i++) dp[i][0] = i;    // delete every character
        for (int j = 0; j <= m; j++) dp[0][j] = j;    // insert every character
        for (int i = 1; i <= n; i++)
            for (int j = 1; j <= m; j++)
                dp[i][j] = a.charAt(i - 1) == b.charAt(j - 1)
                        ? dp[i - 1][j - 1]                            // nothing to do
                        : 1 + Math.min(dp[i - 1][j - 1],              // replace
                                Math.min(dp[i - 1][j], dp[i][j - 1])); // delete, insert
        return dp[n][m];
    }

    public static void main(String[] args) {
        System.out.println("lcs length    " + lcsTable("abcde", "ace")[5][3]);
        System.out.println("lcs itself    " + lcsString("abcde", "ace"));
        System.out.println("lcs itself    " + lcsString("AGGTAB", "GXTXAYB"));
        System.out.println("edit horse    " + editDistance("horse", "ros"));
        System.out.println("edit same     " + editDistance("abc", "abc"));
        System.out.println("edit empty    " + editDistance("", "abcd"));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-two-seq
lcs length    3
lcs itself    ace
lcs itself    GTAB
edit horse    3
edit same     0
edit empty    4
\`\`\`

[Edit Distance](problem:edit-distance) is the same grid with three ways into each
cell instead of two, and the three correspond exactly to the three edits: come
from the diagonal and you replaced a character, from above and you deleted one,
from the left and you inserted one. Once you see that, the recurrence is not
something to memorise.

The family is large: [Interleaving String](problem:interleaving-string),
[Wildcard Matching](problem:wildcard-matching) and
[Regular Expression Matching](problem:regular-expression-matching) are all
two-index grids where the only change is what the cell means and which
predecessors feed it.

## Interval DP

Some problems will not yield to a left-to-right pass, because the answer for a
range depends on splitting it and neither half is a prefix. There the state is a
pair of ends, \`dp[lo][hi]\`, and the loop runs over interval **length**, so every
shorter interval is already finished when a longer one asks for it.

\`\`\`java
for (int len = 2; len <= n; len++)
    for (int lo = 0; lo + len - 1 < n; lo++) {
        int hi = lo + len - 1;
        for (int k = lo + 1; k < hi; k++)      // k is the last one dealt with inside
            dp[lo][hi] = Math.max(dp[lo][hi],
                    dp[lo][k] + a[lo] * a[k] * a[hi] + dp[k][hi]);
    }
\`\`\`

[Burst Balloons](problem:burst-balloons) is the standard one, and it is hard for
a reason worth knowing: the obvious state — "which balloon do I burst first" —
does not work, because bursting changes who is next to whom. Turning it round to
"which balloon do I burst **last** in this range" fixes both ends in place, and
then the two sides are independent. When an interval DP will not come out, the
usual fix is to reverse the order of the decision like that.

Three nested loops means O(n³), which is why interval problems come with small
limits — n up to a few hundred, no more.

## Subsequences: two ways to do LIS

[Longest Increasing Subsequence](problem:longest-increasing-subsequence) has two
standard solutions, and both are worth knowing because the slow one generalises
and the fast one does not.

\`\`\`java Subseq.java @run-dynamic-programming-subseq
import java.util.Arrays;

public class Subseq {

    /** O(n^2): dp[i] is the longest run ending exactly at i. */
    static int lisQuadratic(int[] a) {
        if (a.length == 0) return 0;
        int[] dp = new int[a.length];
        Arrays.fill(dp, 1);                        // every element alone is a run of 1
        int best = 1;
        for (int i = 1; i < a.length; i++) {
            for (int j = 0; j < i; j++)
                if (a[j] < a[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
            best = Math.max(best, dp[i]);
        }
        return best;
    }

    /** O(n log n): tails[k] is the smallest possible tail of a run of length k + 1. */
    static int lisPatience(int[] a) {
        int[] tails = new int[a.length];
        int size = 0;
        for (int v : a) {
            int lo = 0, hi = size;                 // find the first tail >= v
            while (lo < hi) {
                int mid = lo + (hi - lo) / 2;
                if (tails[mid] < v) lo = mid + 1;
                else hi = mid;
            }
            tails[lo] = v;                         // replace it, or extend by one
            if (lo == size) size++;
        }
        return size;
    }

    public static void main(String[] args) {
        int[] a = { 10, 9, 2, 5, 3, 7, 101, 18 };
        System.out.println("quadratic  " + lisQuadratic(a));
        System.out.println("patience   " + lisPatience(a));
        System.out.println("descending " + lisPatience(new int[] { 5, 4, 3, 2, 1 }));
        System.out.println("empty      " + lisQuadratic(new int[] {}));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-subseq
quadratic  4
patience   4
descending 1
empty      0
\`\`\`

The \`tails\` array is not a subsequence — do not print it and expect the answer.
It is a record of the best tail achievable for each length so far, and keeping
each tail as small as possible is what leaves the most room for what comes next.
Its length is the answer. The binary search inside the loop is what turns the
inner O(n) scan into O(log n), and it is the reason this pattern shows up
whenever the limit is 10⁵ rather than 10³.

The quadratic version is the one to reach for when the comparison is not simply
\`<\` — [Russian Doll Envelopes](problem:russian-doll-envelopes) and most "longest
chain" variants start there, and only then get sorted into shape for the fast
version.

## Space: rolling arrays, and the backwards loop

Look at what a row of your table actually reads. If \`dp[i]\` only ever reads
\`dp[i - 1]\` and \`dp[i - 2]\`, there is no reason to keep the other n − 3 cells.
That is \`rolling\` in the first program: two variables instead of an array, O(1)
space.

Grids do the same with two rows, or with one row updated in place. Which of those
is safe depends on the direction of the loop, and the 0/1 knapsack is where it
matters most:

\`\`\`text
one row, capacity ascending          one row, capacity descending
c:   0  1  2  3  4                   c:   4  3  2  1  0
     item of weight 2, value 3            item of weight 2, value 3

dp[2] = dp[0] + 3 = 3                dp[4] = dp[2] + 3
dp[4] = dp[2] + 3 = 6   <- the       dp[2] = dp[0] + 3
        item was used twice                 dp[2] here is still the old row
\`\`\`

Going upwards, \`dp[c - w]\` has already been rewritten by this same item, so the
item can be taken again — which is the **unbounded** knapsack, and exactly what
[Coin Change](problem:coin-change) wants. Going downwards, \`dp[c - w]\` is still
last row's value, so the item is used at most once — which is the **0/1**
knapsack. Same three lines, opposite direction, different problem. Write which
one you mean in a comment; you will forget.

The cost of rolling is that you throw the table away, so you cannot walk back
through it afterwards. If the question wants the answer itself and not its size,
keep the full table.

## Getting the answer back, not just its value

Most DP problems ask for a number, and then one asks for the thing. There are two
ways to recover it.

**Walk the finished table backwards.** At each cell, ask which predecessor could
have produced it, and step there. That is \`lcsString\` above, and it needs no
extra memory beyond the table you already have.

**Record the choice as you go.** Keep a parallel array saying which option won at
each state, then follow it from the end. Slightly more memory, and much easier to
get right when the recurrence has several branches.

\`\`\`java
int[] from = new int[n];          // from[i] = the j that gave dp[i] its value
// ... fill dp and from together ...
List<Integer> path = new ArrayList<>();
for (int i = end; i != -1; i = from[i]) path.add(i);
Collections.reverse(path);
\`\`\`

Either way, the reconstruction is a second pass over a finished table, never part
of the filling. Keep them separate and both stay simple.

## Top-down or bottom-up

Honestly: **memoised recursion is easier to get right under pressure.**

- You write the recursion you already believe, add a cache, and you are done. The
  order in which subproblems get solved sorts itself out.
- It only visits states that are actually reachable. A table fills every cell,
  reachable or not, and sometimes most of them are not.
- The base cases sit where they belong, at the top of the function, instead of
  being pre-loaded into the edges of an array.

Bottom-up wins when you want the constant factor, when you want to roll the
space down to one row, or when the recursion would be 10⁵ frames deep and blow
the JVM stack. It is also easier to reason about the total cost, because the
loops are the state space written out.

Use \`Integer[]\` or an \`int[]\` filled with a sentinel for the cache, not a plain
\`int[]\` of zeroes, whenever zero is a legitimate answer — \`Arrays.fill(cache, -1)\`
and test for \`-1\`. A cache that cannot tell "not computed" from "computed as 0"
recomputes forever and quietly loses you the whole benefit.

## What it costs

The cost is **the number of states times the work done in each**, plus the space
for the states you keep.

| Shape | States | Work per state | Total |
|---|---|---|---|
| Climbing Stairs, House Robber | n | O(1) | O(n) time, O(1) space rolled |
| Coin Change, knapsack | n × amount | O(1) | O(n · amount) |
| LCS, Edit Distance | n × m | O(1) | O(n · m), O(min(n, m)) space rolled |
| LIS, quadratic | n | O(n) | O(n²) |
| LIS, patience | n | O(log n) | O(n log n) |
| Interval DP | n² | O(n) split points | O(n³) |
| Bitmask DP over subsets | 2ⁿ × n | O(n) | O(2ⁿ · n²), so n ≤ 20 |

Read the constraints backwards from that table. \`n ≤ 20\` is asking for a bitmask
— which is what [Shortest Path Visiting All Nodes](problem:shortest-path-visiting-all-nodes)
is, DP over subsets on a graph. \`n ≤ 500\` with two strings is an O(n · m) grid.
\`n ≤ 10⁵\` rules out anything two-dimensional, so the state has to be one number.

## The mistakes, in the order people make them

1. **Writing the table before the recursion.** The recurrence is the thinking.
   Skip it and you are guessing at loop bounds.
2. **A state that does not determine the rest.** If two different histories reach
   the same cell and want different answers, something is missing from the state.
3. **Base cases wrong or missing.** \`dp[0]\` for a counting problem is usually 1,
   not 0 — there is exactly one way to make nothing. For a minimum it is 0, and
   for "impossible" it is a sentinel.
4. **A zero cache with zero as a real answer.** Fill with \`-1\` and test for it.
5. **The 0/1 knapsack inner loop running forwards.** It becomes the unbounded
   version and silently uses an item twice.
6. **Swapping the coin and amount loops** and getting permutations when the
   question wanted combinations, or the other way round.
7. **Off-by-one between the string and the table.** With a \`(n + 1)\` table,
   row \`i\` is about \`a.charAt(i - 1)\`. Pick that convention and never mix it.
8. **Overflow.** Counting paths or ways overflows \`int\` quickly. Use \`long\`, or
   the modulus the problem gives you.
9. **Rolling the array too early**, then discovering the question wants the path.
   Get it right first, shrink it afterwards.
10. **Recursing 10⁵ deep** in a top-down solution. That is when to convert to a
    loop, and the only reason to.

## The Java you will reach for

| You want | Write |
|---|---|
| A one-dimensional table | \`int[] dp = new int[n + 1]\` |
| A two-dimensional one | \`int[][] dp = new int[n + 1][m + 1]\` |
| An empty cache | \`Arrays.fill(dp, -1)\`, or \`int[][]\` filled with \`Arrays.fill(row, -1)\` |
| A "worse than anything real" value | \`amount + 1\`, not \`Integer.MAX_VALUE\` — it is added to |
| Boolean table | \`boolean[] dp = new boolean[target + 1]\`, combine with <code>&#124;=</code> |
| Best of two or three | \`Math.max(a, b)\`, \`Math.max(a, Math.max(b, c))\` |
| Memo on a pair of ints | \`int[][]\`, or a \`HashMap<Long, Integer>\` keyed \`i * 1000L + j\` |
| Copy a row | \`dp = prev.clone()\` or \`System.arraycopy(prev, 0, dp, 0, n)\` |
| Big counts | \`long\`, and \`% 1_000_000_007\` at every addition |

\`Math.max\` on \`long\` and on \`int\` are different overloads, and mixing them
promotes silently — which is usually what you want, but check the type of the
array you are assigning into.

## Working one from the sheet

[Minimum Path Sum](problem:minimum-path-sum): a grid of non-negative numbers,
move only right or down, find the cheapest route from the top-left to the
bottom-right.

Start with the state. To decide the rest of the journey from a cell, you need to
know which cell you are on — and nothing else, because the route behind you does
not change what lies ahead. So the state is \`(row, col)\`, and \`dp[r][c]\` is the
cheapest way to *arrive* at that cell. You arrive from above or from the left, so
the recurrence is the cheaper of those two plus the cost of the cell itself. The
top row and the left column have only one way in, which is what makes the edges
special.

\`\`\`java Grid.java @run-dynamic-programming-grid
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Grid {

    /** One row of the table is enough when you only want the number. */
    static int minPathSum(int[][] g) {
        int rows = g.length, cols = g[0].length;
        int[] dp = new int[cols];
        dp[0] = g[0][0];
        for (int c = 1; c < cols; c++) dp[c] = dp[c - 1] + g[0][c];   // top row
        for (int r = 1; r < rows; r++) {
            dp[0] += g[r][0];                                          // left column
            for (int c = 1; c < cols; c++)
                dp[c] = Math.min(dp[c], dp[c - 1]) + g[r][c];          // above, or left
        }
        return dp[cols - 1];
    }

    /** The whole table, kept so the route itself can be walked back out. */
    static String route(int[][] g) {
        int rows = g.length, cols = g[0].length;
        int[][] dp = new int[rows][cols];
        for (int r = 0; r < rows; r++)
            for (int c = 0; c < cols; c++) {
                int in = 0;
                if (r > 0 && c > 0) in = Math.min(dp[r - 1][c], dp[r][c - 1]);
                else if (r > 0) in = dp[r - 1][c];
                else if (c > 0) in = dp[r][c - 1];
                dp[r][c] = in + g[r][c];
            }

        List<String> cells = new ArrayList<>();
        int r = rows - 1, c = cols - 1;
        while (true) {
            cells.add("(" + r + "," + c + ")");
            if (r == 0 && c == 0) break;
            if (r == 0) c--;                                  // only one way in
            else if (c == 0) r--;
            else if (dp[r - 1][c] <= dp[r][c - 1]) r--;       // came from above
            else c--;                                          // came from the left
        }
        Collections.reverse(cells);
        return String.join(" -> ", cells);
    }

    public static void main(String[] args) {
        int[][] g = { { 1, 3, 1 }, { 1, 5, 1 }, { 4, 2, 1 } };
        System.out.println("cheapest  " + minPathSum(g));
        System.out.println("route     " + route(g));
        System.out.println("one cell  " + minPathSum(new int[][] { { 7 } }));
        System.out.println("one row   " + minPathSum(new int[][] { { 1, 2, 3 } }));
    }
}
\`\`\`

\`\`\`output @run-dynamic-programming-grid
cheapest  7
route     (0,0) -> (0,1) -> (0,2) -> (1,2) -> (2,2)
one cell  7
one row   6
\`\`\`

\`minPathSum\` keeps a single row because a cell only ever reads the cell above it
— which is the same slot in the previous row, and by the time you overwrite it
you have already used it — and the cell to its left, which is the slot you just
wrote. That is the rolling array in its most compact form. \`route\` keeps the
whole table instead, and the price of the number-only version is exactly that it
cannot answer "which way".

If the grid were allowed to contain negative numbers, none of this would change,
which is worth contrasting with a greedy walk: taking the cheaper neighbour at
each step is wrong here, and the counter-example is small. DP tries both and
keeps the better, which is the difference between the two topics.

## How to work through the topic

1. [Climbing Stairs](problem:climbing-stairs),
   [Fibonacci Number](problem:fibonacci-number),
   [N-th Tribonacci Number](problem:n-th-tribonacci-number). Write each three
   ways — brute force, memoised, tabulated — until the translation is automatic.
2. [Min Cost Climbing Stairs](problem:min-cost-climbing-stairs) and
   [House Robber](problem:house-robber). The first real choice per state. Say the
   meaning of \`dp[i]\` out loud before writing the loop.
3. [Unique Paths](problem:unique-paths) then
   [Minimum Path Sum](problem:minimum-path-sum). The move into two dimensions,
   with the edges as the base cases.
4. [Coin Change](problem:coin-change). Then write the two counting versions and
   check you can explain which loop order gives which. This is the single most
   useful hour in the topic.
5. [House Robber II](problem:house-robber-ii) and
   [Best Time to Buy and Sell Stock with Cooldown](problem:best-time-to-buy-and-sell-stock-with-cooldown).
   A constraint that joins the ends, and a state with a small extra dimension.
6. [Longest Common Subsequence](problem:longest-common-subsequence) and
   [Longest Increasing Subsequence](problem:longest-increasing-subsequence). The
   two-sequence grid, and both LIS solutions. Reconstruct the actual subsequence
   in each, not only its length.
7. [Edit Distance](problem:edit-distance) and
   [Dungeon Game](problem:dungeon-game). The second is the one that teaches
   direction: filling it forwards does not work, and understanding why is worth
   more than the solution.
8. [Burst Balloons](problem:burst-balloons),
   [Regular Expression Matching](problem:regular-expression-matching),
   [Best Time to Buy and Sell Stock III](problem:best-time-to-buy-and-sell-stock-iii).
   Leave these until the rest is routine. Each one is a state you have to invent
   rather than recognise, which is the skill the whole topic has been building.

Two neighbours are worth reading alongside this page.
[Recursion and backtracking](#/dsa/recursion-and-backtracking/notes) is where the
recursions come from — every DP starts life as one of those.
[Kadane's algorithm](#/dsa/kadanes-algorithm/notes) is a one-line DP with a name:
"best subarray ending here" is a state, and the recurrence is \`Math.max(a[i],
here + a[i])\`.
`;export{e as default};