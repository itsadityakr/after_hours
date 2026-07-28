var e=`The topic in a page. If a line here is news, the **Notes** part is where it
comes from.

## The budget

![The same quadratic code at three input sizes, against the one-second budget](diagrams/dsa-foundations-revision-the-cliff.jpg)

- A judge gets through roughly **10⁸ simple operations per second**.
- Count the operations for the largest allowed input, compare, decide. That is
  the whole method.
- O(n²) at n = 1,000 is instant. At n = 100,000 it is ten billion, and it is
  two minutes.

## Reading the limit backwards

| Limit | Wants | Usually |
|---|---|---|
| n ≤ 12 | O(n!) / O(2ⁿ n) | permutations, bitmask |
| n ≤ 25 | O(2ⁿ) | subsets, meet in the middle |
| n ≤ 500 | O(n³) | interval DP, Floyd–Warshall |
| n ≤ 5,000 | O(n²) | nested loops, DP table |
| n ≤ 200,000 | O(n log n) | sort, heap, binary search |
| n ≤ 10⁶ | O(n) | one pass, prefix sum, sliding window |
| n ≤ 10⁹ | O(log n) / O(√n) | binary search **on the answer**, maths |

- The constraints are the question telling you the answer. Read them first.

## Big O

![The O(1) space answer against the O(n) space answer](diagrams/dsa-foundations-revision-space-trade.jpg)

- Drop constants. Keep the largest term. O(3n² + n) is O(n²).
- Loops multiply; sequential blocks add.
- O(log n) is "throw away half each step". A billion is thirty steps.
- Space excludes the input. Swapping in place is O(1); a \`HashSet\` of n keys is
  O(n).
- Recursion depth n is O(n) space. Around 10⁴ frames in Java is a
  \`StackOverflowError\`.

## What a structure costs

| Structure | Get | Add | Remove | Find |
|---|---|---|---|---|
| \`int[]\` | O(1) | — | — | O(n) |
| \`ArrayList\` | O(1) | O(1) end | O(n) middle | O(n) |
| \`HashMap\` / \`HashSet\` | O(1) | O(1) | O(1) | O(1) |
| \`TreeMap\` / \`TreeSet\` | O(log n) | O(log n) | O(log n) | O(log n), in order |
| \`ArrayDeque\` | — | O(1) ends | O(1) ends | O(n) |
| \`PriorityQueue\` | O(1) peek | O(log n) | O(log n) | O(n) |

- \`HashMap\` O(1) is an average, not a promise.
- Choose \`TreeMap\` only when you need neighbours — \`floorKey\`, \`ceilingKey\`.

## The hidden costs

- \`list.contains(x)\` is O(n). \`set.contains(x)\` is O(1). The loop looks the same.
- \`list.remove(0)\` shifts every element.
- \`s += x\` in a loop copies the whole string each time. Use \`StringBuilder\`.
- \`substring\` in Java copies; it does not share.
- \`Arrays.sort(int[])\` is quicksort with an O(n²) worst case. On objects it is a
  merge sort and guaranteed O(n log n).

## Worth remembering

- \`map.merge(k, 1, Integer::sum)\` is the counting idiom.
- \`map.computeIfAbsent(k, x -> new ArrayList<>()).add(v)\` is the grouping idiom.
- Sums of large arrays need \`long\`. Cast one operand, not the result.
- A pattern is three lines: when it applies, the skeleton, and what breaks it.
  Write those down per problem; the solution itself does not transfer.
`;export{e as default};