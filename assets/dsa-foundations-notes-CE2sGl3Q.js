var e=`Everything else on this sheet is a pattern. This topic is the vocabulary those
patterns are described in: what it means for a solution to be too slow, what a
structure costs to use, and how to tell from the question itself which shape of
answer is being asked for.

It is short, and it is worth an hour before the categories that assume it —
because the single most common way to fail an interview problem is not writing a
wrong solution. It is writing a correct one that was never going to run in time,
and only finding out at the end.

## What "too slow" actually means

A computer does a fixed amount of work per second. Not exactly, but closely
enough to plan with: **a judge machine gets through roughly 10⁸ simple
operations per second**, and problems are usually given one or two seconds.

So the question "is my solution fast enough" becomes arithmetic. Count roughly
how many operations it does for the largest input allowed, and compare it to a
hundred million.

| n | O(n) | O(n log n) | O(n²) | O(2ⁿ) |
|---|---|---|---|---|
| 10 | 10 | 33 | 100 | 1,024 |
| 1,000 | 1,000 | ~10,000 | 1,000,000 | far too many |
| 100,000 | 100,000 | ~1.7 million | 10 billion | — |
| 1,000,000 | 1 million | ~20 million | — | — |

Read across the O(n²) row. At n = 1,000 it is a million operations, which is
instant. At n = 100,000 it is ten billion, which is about two minutes. The
algorithm did not change. The input did, and it walked straight off a cliff.

That cliff is why the constraint at the bottom of a problem statement is not
decoration.

![What each complexity actually costs at n of one million, drawn to scale](diagrams/dsa-foundations-notes-cost-at-a-million.jpg)

## Big O, without the mathematics

Big O is a way of saying **how the work grows as the input grows**, ignoring
everything that does not change that.

Two rules do almost all of the work:

- **Drop the constants.** A loop doing three things per element is O(n), not
  O(3n). Whether it is three or thirty does not change the shape of the curve.
- **Keep only the largest term.** A pass of O(n²) followed by a pass of O(n) is
  O(n²). At the sizes that matter the smaller one has stopped mattering.

And then the shapes themselves, in the order you will meet them:

| Notation | Called | It looks like |
|---|---|---|
| O(1) | constant | array index, hash map get, arithmetic |
| O(log n) | logarithmic | binary search, heap push, halving anything |
| O(n) | linear | one pass over the input |
| O(n log n) | linearithmic | sorting, or n things each costing a log |
| O(n²) | quadratic | a loop inside a loop over the same input |
| O(2ⁿ) | exponential | every subset |
| O(n!) | factorial | every ordering |

The one people find least intuitive is O(log n). It is what you get when each
step throws away half of what is left. Halving a million takes twenty steps;
halving a billion takes thirty. Logarithms grow so slowly that a log factor is
very nearly free, which is why "sort it first" is so often the right move.

**Space is counted the same way**, and the input itself does not count. A
solution that allocates one \`HashSet\` holding up to n keys is O(n) extra space;
one that swaps elements inside the array it was given is O(1). Interviewers ask
for O(1) space specifically to rule out the map, which is usually where the easy
answer lives.

## Reading the constraints backwards

This is the most useful habit in the topic. The limit on \`n\` tells you what
complexity is being asked for, which usually tells you the technique.

\`\`\`java
// read the limit, then pick the shape it allows
if (n <= 10)      bruteForce();      // even O(n!) fits
else if (n <= 5_000)   quadratic();  // O(n^2)
else if (n <= 200_000) sortOrHeap(); // O(n log n)
else                   onePass();    // O(n), and mind the constant
\`\`\`

Spelled out:

| The limit says | So it wants | Which usually means |
|---|---|---|
| n ≤ 12 | O(n!) or O(2ⁿ n) | permutations, bitmask over subsets |
| n ≤ 25 | O(2ⁿ) | subsets, meet in the middle |
| n ≤ 500 | O(n³) | interval DP, Floyd–Warshall |
| n ≤ 5,000 | O(n²) | two nested loops, or a DP table |
| n ≤ 200,000 | O(n log n) | sort, heap, binary search, ordered set |
| n ≤ 10⁶ | O(n) | one pass, prefix sums, sliding window |
| n ≤ 10⁹ | O(log n) or O(√n) | binary search on the *answer*, maths |

That last row is the one worth staring at. When \`n\` is a billion you cannot even
look at the input once, so the input is not a list — the answer itself is what
you search over. That is the whole idea behind binary search on the answer, and
recognising it starts here.

## What a structure costs

The patterns later are mostly about picking the right container. These are the
numbers behind that choice.

| Structure | Get | Add | Remove | Find a value |
|---|---|---|---|---|
| \`int[]\` | O(1) | — | — | O(n) |
| \`ArrayList\` | O(1) | O(1) at the end | O(n) in the middle | O(n) |
| \`LinkedList\` | O(n) | O(1) at either end | O(1) given the node | O(n) |
| \`HashMap\` / \`HashSet\` | O(1) | O(1) | O(1) | O(1) |
| \`TreeMap\` / \`TreeSet\` | O(log n) | O(log n) | O(log n) | O(log n), **in order** |
| \`ArrayDeque\` | — | O(1) both ends | O(1) both ends | O(n) |
| \`PriorityQueue\` | O(1) peek | O(log n) | O(log n) pop | O(n) |

The O(1) on a \`HashMap\` is an average, not a promise: it assumes the keys spread
out. It is close enough to true that you can plan with it, and the reason a
\`HashMap\` shows up in half the solutions on the sheet.

The reason to ever choose a \`TreeMap\` over it is the last column. A hash map
answers "is this key here"; a tree map also answers "what is the smallest key
above this one", which is a different question and one that comes up constantly
in [intervals](#/dsa/intervals/notes) and range problems.

![A ladder of questions that picks the container](diagrams/dsa-foundations-notes-pick-a-structure.jpg)

\`\`\`java Costs.java @run-dsa-foundations-costs
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Costs {

    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(3, 1, 4, 1, 5));
        System.out.println("list         " + list + "  get(2) = " + list.get(2));

        Map<String, Integer> counts = new HashMap<>();
        for (String word : "a b a c a b".split(" "))
            counts.merge(word, 1, Integer::sum);
        System.out.println("counts       " + counts);

        TreeMap<Integer, String> tree = new TreeMap<>();
        tree.put(10, "ten");
        tree.put(20, "twenty");
        tree.put(30, "thirty");
        System.out.println("first >= 15  " + tree.ceilingEntry(15));
        System.out.println("last  <= 15  " + tree.floorEntry(15));

        Deque<Integer> deque = new ArrayDeque<>();
        deque.addLast(1);
        deque.addLast(2);
        deque.addFirst(0);
        System.out.println("deque        " + deque + "  ends " + deque.peekFirst()
                + " and " + deque.peekLast());
    }
}
\`\`\`

\`\`\`output @run-dsa-foundations-costs
list         [3, 1, 4, 1, 5]  get(2) = 4
counts       {a=3, b=2, c=1}
first >= 15  20=twenty
last  <= 15  10=ten
deque        [0, 1, 2]  ends 0 and 2
\`\`\`

\`merge(key, 1, Integer::sum)\` is the idiomatic way to count in Java: put a 1 if
the key is new, otherwise add 1 to what is there. You will write it several
hundred times before this sheet is finished.

## What a pattern is

A pattern is not a template to memorise. It is a **pairing between a shape of
question and a shape of answer** — and the value of learning them as a group is
that recognising one costs seconds, while deriving it from scratch costs the
interview.

Concretely, every topic on this sheet answers three questions:

- **When does this apply?** The one sentence on the card. *A sorted array and a
  question about a pair* is two pointers, every time.
- **What is the skeleton?** The five lines that survive when the
  problem-specific parts are removed.
- **What breaks it?** The edge case that is not in the example — the empty
  input, the duplicate, the overflow, the equal pair.

When you finish a problem, write those three lines down for it. That is the
thing that transfers to the next problem; the solution itself does not.

## Working out the cost of your own code

Two rules and one trap.

**Loops multiply.** A loop inside a loop, each over n, is n × n.

\`\`\`java
for (int i = 0; i < n; i++)          // n
    for (int j = 0; j < n; j++)      // × n
        work();                      // = O(n^2)
\`\`\`

**Sequential blocks add**, and then the larger one wins. Sorting and then making
one pass is O(n log n) + O(n) = O(n log n).

The trap is a method call that hides a loop. This looks linear and is quadratic:

\`\`\`java
for (int i = 0; i < n; i++)
    if (list.contains(a[i]))   // contains() on a List is O(n) by itself
        found++;
\`\`\`

The same code with a \`HashSet\` instead of a \`List\` really is linear. \`contains\`
on a list walks it; \`contains\` on a set hashes once. Nothing in the shape of the
loop tells you that, which is why the table above is worth knowing rather than
looking up.

A shorter list of hidden costs worth remembering: \`String\` concatenation in a
loop copies the whole string every time; \`list.remove(0)\` shifts every element;
\`substring\` in Java copies rather than sharing; and \`contains\` on anything that
is not a hash structure is a scan.

![The same loop is linear or quadratic depending on the container](diagrams/dsa-foundations-notes-hidden-loop.jpg)

## The mistakes, in the order people make them

1. **Coding before reading the constraints.** They are the question telling you
   the answer.
2. **Counting operations instead of shape.** O(2n) and O(n) are the same thing.
   Do not optimise a constant while the exponent is wrong.
3. **Forgetting the cost of the library call.** \`contains\`, \`remove(0)\`,
   \`substring\`, \`+\` on strings.
4. **Ignoring space.** An O(n) map inside an O(n) loop is not O(n) space if you
   build a fresh one each pass.
5. **Assuming recursion is free.** Each call is a stack frame; depth n is O(n)
   space, and around ten thousand frames in Java is a \`StackOverflowError\`.
6. **\`int\` where the arithmetic needs \`long\`.** Sums of large arrays overflow
   silently and the answer is simply wrong.
7. **Optimising the wrong half.** A hash map inside a triple loop is still
   cubic.

## The Java you will reach for

| You want | Write |
|---|---|
| A growable list | \`List<Integer> a = new ArrayList<>()\` |
| Count per key | \`map.merge(key, 1, Integer::sum)\` |
| Default when absent | \`map.getOrDefault(key, 0)\` |
| Build a list per key | \`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)\` |
| A set of seen things | \`Set<Integer> seen = new HashSet<>()\` |
| Sorted keys, with neighbours | \`TreeMap\` — \`floorKey\`, \`ceilingKey\` |
| A stack or a queue | \`Deque<Integer> d = new ArrayDeque<>()\` |
| A smallest-first heap | \`PriorityQueue<Integer> pq = new PriorityQueue<>()\` |
| Sort with a rule | \`Arrays.sort(a, Comparator.comparingInt(x -> x[0]))\` |
| Sixty-four-bit arithmetic | \`long total = 0;\` and cast one operand |

One Java-specific warning that costs people real submissions: \`Arrays.sort\` on
an \`int[]\` is a dual-pivot quicksort with a worst case of O(n²), and inputs
designed to hit it exist. On an \`Integer[]\` or a \`List\` it is a merge sort with a
guaranteed O(n log n). If a sort of primitives is timing out on a large adversarial
input, boxing it or shuffling it first is the fix.

## How to work through the topic

The problems here are deliberately ones you have probably seen. The exercise is
not to solve them — it is to say the complexity out loud before you start, and
check it after.

1. [FizzBuzz](problem:fizz-buzz), [Reverse a String](problem:reverse-string),
   [Palindrome Number](problem:palindrome-number). One pass each. Say "O(n) time,
   O(1) space" before writing, and be right.
2. [Fibonacci Number](problem:fibonacci-number),
   [Climbing Stairs](problem:climbing-stairs). Write the naive recursion, work
   out that it is O(2ⁿ), then fix it to O(n). This is the clearest example on
   the sheet of a complexity change that is a code change of two lines.
3. [Valid Palindrome](problem:valid-palindrome),
   [Reverse Integer](problem:reverse-integer). The edge cases are the problem:
   non-letters, and overflow.
4. [String to Integer (atoi)](problem:string-to-integer-atoi),
   [Excel Sheet Column Number](problem:excel-sheet-column-number). Both are
   place-value arithmetic and both are mostly about the awkward cases.
5. [Add Binary](problem:add-binary), [Multiply Strings](problem:multiply-strings),
   [Basic Calculator](problem:basic-calculator). Long-hand arithmetic on text,
   which is where a clear plan beats cleverness by a mile.

Do not linger. The rest of the sheet is where the patterns are; this topic is
the language they are written in, and you learn a language by using it.
`;export{e as default};