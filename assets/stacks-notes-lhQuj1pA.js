var e=`A stack is a pile. You put things on the top, and the only thing you can take
off is the top. That single restriction is the whole structure, and it is worth
more than it sounds — a surprising number of problems are really asking "what is
the most recent thing that is still unfinished", and that is exactly what the
top of a stack holds.

Last in, first out, usually written LIFO. Brackets are the introduction: an
opener is unfinished business, a closer settles the most recent piece of it. But
the reason this topic sits where it does is the monotonic stack — a stack you
keep in order by throwing away anything that can never be the answer again. The
brute force it replaces is always the same shape: for every element, look
backwards or forwards until you find one that beats it. Two nested loops, O(n²),
correct, and doing the same comparisons over and over. The stack remembers the
comparisons instead.

## The structure, and the class to use

Java has a class called \`Stack\`. Do not use it. It dates from 1995, every one of
its methods is \`synchronized\` — a lock you pay for and do not use — and it
extends \`Vector\`, so it iterates and prints from the bottom up, the opposite of
the order you think in. It is kept only because old code depends on it.

\`\`\`java
Deque<Integer> stack = new ArrayDeque<>();   // the one to use

stack.push(3);          // put on the top
stack.push(7);
int top = stack.peek(); // 7  — look, do not remove
int got = stack.pop();  // 7  — look and remove
boolean none = stack.isEmpty();
\`\`\`

\`Deque\` is the interface for a double-ended queue — see
[deque](#/dsa/deque/notes) — and a stack is a deque you only ever touch one end
of. \`ArrayDeque\` is the implementation: a circular array that doubles when it
fills. \`push\`, \`pop\` and \`peek\` all work on the head, so the three read exactly
like a stack and cost O(1) each.

Three things to know before they bite:

- **It rejects \`null\`.** \`push(null)\` throws \`NullPointerException\`, because
  \`peek()\` returns \`null\` to mean "empty" and a \`null\` element would make that
  answer ambiguous.
- **\`pop()\` on an empty deque throws \`NoSuchElementException\`;** \`poll()\`
  returns \`null\` instead. Guard with \`isEmpty()\` and it never comes up.
- **\`Deque<Integer>\` stores boxed \`Integer\` objects.** Comparing two popped
  values with \`==\` compares references and is wrong above 127. Assign to an
  \`int\` first, or use \`.equals\`.

## The idea: matching brackets

[Valid Parentheses](problem:valid-parentheses) gives you a string of \`()[]{}\`
and asks whether every bracket is closed by the right kind, in the right order.
Read left to right. An opener is a promise not yet kept, so push it. A closer
settles the most recent unkept promise, so pop and check the two match. At the
end the pile must be empty.

\`\`\`text
s = "{[()]}"                       s = "([)]"
{   push          stack: {         (   push          stack: (
[   push          stack: { [       [   push          stack: ( [
(   push          stack: { [ (     )   pop -> [      ')' wanted '(':
)   pop -> (      matches                            invalid straight away
]   pop -> [      matches
}   pop -> {      matches, and the stack is empty -> valid
\`\`\`

Two failure modes, and forgetting one of them is the usual bug. A closer
arriving when the stack is empty is \`")("\`, invalid. A stack left non-empty at
the end is \`"(("\`, also invalid.

![The two ways a bracket string fails, and the one way it passes](diagrams/stacks-notes-two-failures.jpg)

\`\`\`java Brackets.java @run-stacks-brackets
import java.util.ArrayDeque;
import java.util.Deque;

public class Brackets {

    /** True when every bracket is closed by the matching kind, in the right order. */
    static boolean balanced(String s) {
        String openers = "([{", closers = ")]}";
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            int kind = closers.indexOf(c);           // -1 when c is an opener
            if (kind < 0) stack.push(c);             // unfinished business
            else if (stack.isEmpty()) return false;  // a closer with nothing open
            else if (stack.pop() != openers.charAt(kind)) return false;   // wrong kind
        }
        return stack.isEmpty();                      // anything left over is unclosed
    }

    public static void main(String[] args) {
        String[] tests = { "()", "()[]{}", "{[()]}", "(]", "([)]", "(", ")", "" };
        for (String t : tests) System.out.printf("%-10s %s%n", "\\"" + t + "\\"", balanced(t));
    }
}
\`\`\`

\`\`\`output @run-stacks-brackets
"()"       true
"()[]{}"   true
"{[()]}"   true
"(]"       false
"([)]"     false
"("        false
")"        false
""         true
\`\`\`

\`stack.pop() != openers.charAt(kind)\` compares two \`char\` values, not two
\`Integer\` objects, so \`!=\` is safe here. With \`Integer\` it would not be.

## The monotonic stack

![What a monotonic stack has answered, and what is still waiting on it](diagrams/stacks-notes-leftovers.jpg)

A monotonic stack is a stack whose contents are kept in order — increasing or
decreasing — by popping anything that breaks the order before pushing. What
makes it useful is what the popping means: an element you pop can never be the
answer to a later question, so throwing it away costs nothing.

[Next Greater Element I](problem:next-greater-element-i) is the model. For each
position, what is the first value to its right that is bigger? Walk left to
right holding a stack of indices whose values are **decreasing**. When a new
value arrives, every index on the stack with a smaller value has just found its
answer. Pop them and record it, then push the new index.

\`\`\`text
a = [2, 1, 2, 4, 3]        stack holds indices, values decreasing

i=0  a[0]=2   stack empty            push 0        stack: [0]        (values 2)
i=1  a[1]=1   a[0]=2 > 1, no pop     push 1        stack: [0,1]      (2,1)
i=2  a[2]=2   a[1]=1 < 2  -> ans[1]=2, pop
              a[0]=2 not < 2         push 2        stack: [0,2]      (2,2)
i=3  a[3]=4   a[2]=2 < 4  -> ans[2]=4, pop
              a[0]=2 < 4  -> ans[0]=4, pop
                                     push 3        stack: [3]        (4)
i=4  a[4]=3   a[3]=4 not < 3         push 4        stack: [3,4]      (4,3)

left on the stack at the end: 3 and 4, so ans[3] = ans[4] = -1
ans = [4, 2, 4, -1, -1]
\`\`\`

The stack is never scanned. Every step only looks at the top, which is why this
is linear.

## The shape

\`\`\`java
Deque<Integer> st = new ArrayDeque<>();
for (int i = 0; i < a.length; i++) {
    while (!st.isEmpty() && a[st.peek()] < a[i]) ans[st.pop()] = a[i];
    st.push(i);
}
\`\`\`

- \`st\` holds **indices**, not values. Push indices whenever the answer needs a
  distance, a width or a position. You can get the value back with
  \`a[st.peek()]\`; you cannot get the index back from a value.
- The \`while\` is not an \`if\`. One arriving element can settle several waiting
  ones at once, as \`i=3\` did above.
- Anything still on the stack when the loop ends never found an answer. Pre-fill
  the result with the "none" value — usually \`-1\` — and you need no drain loop.
- The comparison decides the question:

| Comparison to pop on | The stack stays | Each pop learns |
|---|---|---|
| \`a[st.peek()] < a[i]\` | decreasing | next strictly greater to the right |
| \`a[st.peek()] <= a[i]\` | strictly decreasing | next greater, ties broken left |
| \`a[st.peek()] > a[i]\` | increasing | next smaller to the right |
| \`a[st.peek()] >= a[i]\` | strictly increasing | next smaller or equal |

The *previous* smaller or greater element is the same loop with the answer read
at a different moment: pop until the top is smaller than you, and whatever is
left on top **is** your previous smaller element.

\`\`\`java Monotonic.java @run-stacks-monotonic
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Monotonic {

    /** For each i, the first value to its right that is larger. -1 when there is none. */
    static int[] nextGreater(int[] a) {
        int[] ans = new int[a.length];
        Arrays.fill(ans, -1);                        // the answer for anything left over
        Deque<Integer> st = new ArrayDeque<>();      // indices, values decreasing
        for (int i = 0; i < a.length; i++) {
            while (!st.isEmpty() && a[st.peek()] < a[i]) ans[st.pop()] = a[i];
            st.push(i);
        }
        return ans;
    }

    /** For each i, the index of the nearest smaller value to its left. -1 when none. */
    static int[] previousSmaller(int[] a) {
        int[] ans = new int[a.length];
        Deque<Integer> st = new ArrayDeque<>();      // indices, values increasing
        for (int i = 0; i < a.length; i++) {
            while (!st.isEmpty() && a[st.peek()] >= a[i]) st.pop();
            ans[i] = st.isEmpty() ? -1 : st.peek();  // read before pushing yourself
            st.push(i);
        }
        return ans;
    }

    /** Daily Temperatures: the same loop, but the answer wanted is a distance. */
    static int[] daysUntilWarmer(int[] t) {
        int[] ans = new int[t.length];
        Deque<Integer> st = new ArrayDeque<>();
        for (int i = 0; i < t.length; i++) {
            while (!st.isEmpty() && t[st.peek()] < t[i]) {
                int j = st.pop();
                ans[j] = i - j;
            }
            st.push(i);
        }
        return ans;
    }

    public static void main(String[] args) {
        int[] a = { 2, 1, 2, 4, 3 };
        System.out.println("input             " + Arrays.toString(a));
        System.out.println("next greater      " + Arrays.toString(nextGreater(a)));
        System.out.println("prev smaller idx  " + Arrays.toString(previousSmaller(a)));

        int[] temps = { 73, 74, 75, 71, 69, 72, 76, 73 };
        System.out.println("temperatures      " + Arrays.toString(temps));
        System.out.println("days to wait      " + Arrays.toString(daysUntilWarmer(temps)));

        System.out.println("all descending    " + Arrays.toString(nextGreater(new int[] { 5, 4, 3 })));
        System.out.println("empty             " + Arrays.toString(nextGreater(new int[] {})));
    }
}
\`\`\`

\`\`\`output @run-stacks-monotonic
input             [2, 1, 2, 4, 3]
next greater      [4, 2, 4, -1, -1]
prev smaller idx  [-1, -1, 1, 2, 2]
temperatures      [73, 74, 75, 71, 69, 72, 76, 73]
days to wait      [1, 1, 4, 2, 1, 1, 0, 0]
all descending    [-1, -1, -1]
empty             []
\`\`\`

In \`daysUntilWarmer\` the answer is \`i - j\`, a gap between two positions — the
clearest reason to keep indices rather than values. Note that \`ans\` needs no
filling: a temperature that never gets warmer keeps the \`0\` an \`int[]\` starts
with, which is what [Daily Temperatures](problem:daily-temperatures) asks for.

## Why it is linear

The \`while\` inside the \`for\` looks quadratic and is not, and the argument is
worth being able to say out loud:

> Each index is pushed exactly once, and once popped it is never pushed again.
> So across the whole run there are at most n pushes and at most n pops. The
> inner \`while\` can run many times on one step of the outer loop, but the total
> over all steps is bounded by the number of things ever pushed.

That is an **amortised** argument: one step can be expensive, but the expensive
steps are paid for by cheap ones that happened earlier. O(n) time. Space is O(n)
for the stack — a strictly decreasing input puts every index on it at once.

## Largest Rectangle in Histogram

![At the moment of the pop, both bounds of the rectangle are known](diagrams/stacks-notes-histogram-bounds.jpg)

[Largest Rectangle in Histogram](problem:largest-rectangle-in-histogram) is the
hard problem this pattern was built for, and it is nothing more than "previous
smaller" and "next smaller" used together.

Bars of given heights, each one unit wide. Fix which bar is the **shortest** in
the rectangle: the height is that bar's height, and the rectangle stretches left
until the first shorter bar and right until the next shorter bar. Keep indices
with increasing heights, and when bar \`i\` is shorter than the top, the top has
just found its next smaller element — \`i\` — while its previous smaller element
is whatever sits under it on the stack. Both bounds, at the moment of the pop.

\`\`\`text
h = [2, 1, 5, 6, 2, 3]

i=2 push, i=3 push        stack (indices): 2 3     heights 5 6
i=4  h[4]=2 < 6  pop 3 -> height 6, left bound index 2, width 4-2-1 = 1  area 6
     h[4]=2 < 5  pop 2 -> height 5, left bound index 1, width 4-1-1 = 2  area 10
i=6  sentinel 0  pops everything; index 1 (height 1) spans the lot: width 6, area 6
best = 10
\`\`\`

The **sentinel** removes the clean-up loop. Run the index one past the end and
treat the height there as 0. Zero is shorter than everything, so it pops the
entire stack, and every bar left waiting is measured by the same code as the
rest. Without it you write the same logic twice.

\`\`\`java Histogram.java @run-stacks-histogram
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Histogram {

    /**
     * The largest rectangle under a skyline of unit-wide bars. The bar below the
     * popped one is its previous smaller; the bar arriving now is its next smaller.
     */
    static int largest(int[] h) {
        Deque<Integer> st = new ArrayDeque<>();       // indices, heights increasing
        int best = 0;
        for (int i = 0; i <= h.length; i++) {
            int height = (i == h.length) ? 0 : h[i];  // the sentinel
            while (!st.isEmpty() && h[st.peek()] >= height) {
                int top = st.pop();
                int left = st.isEmpty() ? -1 : st.peek(); // -1 means "runs to the start"
                best = Math.max(best, h[top] * (i - left - 1));
            }
            st.push(i);
        }
        return best;
    }

    public static void main(String[] args) {
        int[][] tests = { { 2, 1, 5, 6, 2, 3 }, { 2, 4 }, { 1, 1, 1, 1 }, { 5 }, {} };
        for (int[] t : tests) System.out.printf("%-18s %d%n", Arrays.toString(t), largest(t));
    }
}
\`\`\`

\`\`\`output @run-stacks-histogram
[2, 1, 5, 6, 2, 3] 10
[2, 4]             4
[1, 1, 1, 1]       4
[5]                5
[]                 0
\`\`\`

\`i - left - 1\` is the line to get right. The rectangle covers every index
strictly between \`left\` and \`i\`, and the gap between two exclusive bounds is
\`i - left - 1\`. Draw it on the trace above rather than trusting it.

## Evaluating reverse Polish notation

[Evaluate Reverse Polish Notation](problem:evaluate-reverse-polish-notation)
gives you \`["2","1","+","3","*"]\`, meaning \`(2 + 1) * 3\`. The notation needs no
brackets because the order is already unambiguous, which is why a stack
evaluates it in one pass. A number is an operand nobody has used yet, so push
it. An operator consumes the two most recent operands and produces one.

\`\`\`java
static int evaluate(String[] tokens) {
    Deque<Integer> st = new ArrayDeque<>();
    for (String t : tokens) {
        switch (t) {
            case "+" -> st.push(st.pop() + st.pop());
            case "*" -> st.push(st.pop() * st.pop());
            case "-" -> { int b = st.pop(); st.push(st.pop() - b); }
            case "/" -> { int b = st.pop(); st.push(st.pop() / b); }
            default  -> st.push(Integer.parseInt(t));
        }
    }
    return st.pop();
}
\`\`\`

\`\`\`expected
evaluate({"2","1","+","3","*"})   ->  9
evaluate({"4","13","5","/","+"})  ->  6
\`\`\`

\`+\` and \`*\` may pop in either order because they commute. \`-\` and \`/\` may not,
and the second value popped is the left operand — the one bug this problem has.
\`st.pop() - st.pop()\` compiles, Java does evaluate arguments left to right, and
the sign comes out wrong with no warning. The same stack handles
[Basic Calculator II](problem:basic-calculator-ii) and
[Score of Parentheses](problem:score-of-parentheses): push what is pending,
resolve it when the token that closes it arrives.

## Min Stack: carry the answer with the element

[Min Stack](problem:min-stack) wants \`push\`, \`pop\`, \`top\` and \`getMin\`, all
O(1). Scanning on demand is O(n), and one \`min\` field fails the moment you pop
the element that was the minimum — you have no idea what it was before. So store
next to each element the minimum of everything at or below it in the pile. That
value never needs recomputing, because popping restores a state whose answer was
already written down.

\`\`\`java
Deque<int[]> st = new ArrayDeque<>();   // { value, minimum at or below }

void push(int x) {
    int min = st.isEmpty() ? x : Math.min(x, st.peek()[1]);
    st.push(new int[] { x, min });
}
int pop()    { return st.pop()[0]; }
int getMin() { return st.peek()[1]; }
\`\`\`

The other spelling is two stacks — values, and minima pushed to only when the
new value is less than **or equal to** the current minimum. It saves memory when
new minima are rare, and the \`<=\` matters: with \`<\`, two equal minima push once
and pop twice, taking the minimum away too early.

## Decode String, and nesting

[Decode String](problem:decode-string) turns \`3[a2[c]]\` into \`accaccacc\`. The
brackets nest, and each level has its own repeat count and its own partial
result — a pile of unfinished contexts. On \`[\`, push the count and the string so
far, then start fresh. On \`]\`, pop them back and append the finished inner
string that many times.

\`\`\`java
Deque<Integer> counts = new ArrayDeque<>();
Deque<StringBuilder> parts = new ArrayDeque<>();
StringBuilder cur = new StringBuilder();
int k = 0;

for (char c : s.toCharArray()) {
    if (Character.isDigit(c)) k = k * 10 + (c - '0');     // counts can be multi-digit
    else if (c == '[') { counts.push(k); parts.push(cur); k = 0; cur = new StringBuilder(); }
    else if (c == ']') {
        StringBuilder outer = parts.pop();
        for (int i = counts.pop(); i > 0; i--) outer.append(cur);
        cur = outer;
    } else cur.append(c);
}
\`\`\`

\`k = k * 10 + (c - '0')\` is there because \`12[ab]\` has a two-digit count, and
reading one character as the number is the mistake almost everyone makes first.

## Turning a recursion into a loop

Recursion already uses a stack — the call stack — so every recursive function can
be rewritten with an explicit one. Worth practising, because deep recursion
overflows and because interviewers ask for it. Whatever a recursive call would
have remembered as "where to come back to", you push yourself.

\`\`\`java
void visit(Node n) {                    // recursive
    if (n == null) return;
    process(n);
    visit(n.left);
    visit(n.right);
}

Deque<Node> st = new ArrayDeque<>();    // the same traversal, iteratively
st.push(root);
while (!st.isEmpty()) {
    Node n = st.pop();
    if (n == null) continue;
    process(n);
    st.push(n.right);                   // pushed first, so it comes off second
    st.push(n.left);
}
\`\`\`

The push order is reversed, and it has to be: the stack hands back the last
thing pushed, so pushing right first is what makes left come out first. Getting
this backwards gives a mirrored traversal that looks almost right. The same
translation turns a depth-first search over a
[binary tree](#/dsa/binary-tree/notes) or a [graph](#/dsa/graphs/notes) into a
loop.

## What it costs

| Operation | Cost | Why |
|---|---|---|
| \`push\`, \`pop\`, \`peek\` | O(1) | one array slot, one index moved |
| Growing the array | amortised O(1) | doubling, so n pushes copy 2n slots in all |
| A monotonic pass over n items | O(n) | each index pushed once and popped once |
| Space | O(n) | a sorted input keeps everything on the stack |
| \`Stack\` (the legacy class) | O(1) plus a lock | every method is synchronised |

## The mistakes, in the order people make them

1. **Using \`java.util.Stack\`.** Synchronised, extends \`Vector\`, prints
   bottom-to-top. Write \`Deque<Integer> st = new ArrayDeque<>()\`.
2. **\`pop\` on an empty stack.** \`NoSuchElementException\`. Every popping \`while\`
   needs \`!st.isEmpty()\` first — \`&&\` short circuits, and swapping the halves
   throws.
3. **Forgetting the leftovers.** Everything still on the stack at the end has no
   answer. Pre-fill the result, or write the drain loop.
4. **\`if\` instead of \`while\`.** One arriving element can settle several waiting
   ones; an \`if\` settles one and leaves the rest silently wrong.
5. **Pushing values when you need indices.** Any answer that is a width, a
   distance or a position needs the index, and going back is impossible.
6. **\`<\` versus \`<=\` in the pop test.** With duplicates these differ. Decide
   whether equal elements should pop, and be able to say why.
7. **\`==\` on popped \`Integer\` values.** Reference equality, correct up to 127 by
   accident. Assign to \`int\`, or use \`.equals\`.
8. **Wrong operand order for \`-\` and \`/\`,** and the wrong push order in an
   iterative traversal. Both give plausible, wrong answers.

## The Java you will reach for

| You want | Write |
|---|---|
| A stack | \`Deque<Integer> st = new ArrayDeque<>()\` |
| Put on / take off the top | \`st.push(x)\` / \`st.pop()\` — \`pop\` throws if empty |
| Take off, or \`null\` | \`st.poll()\` |
| Look at the top | \`st.peek()\` — \`null\` if empty |
| Empty? | \`st.isEmpty()\`, \`st.size()\` |
| Stack of pairs | \`Deque<int[]> st\` with \`new int[] { a, b }\` |
| Characters of a string | \`for (char c : s.toCharArray())\` |
| Build a string | \`StringBuilder\` — \`append\`, \`reverse\`, \`toString\` |
| Fill an answer array | \`Arrays.fill(ans, -1)\` |
| Read a digit character | \`c - '0'\` |

\`push\`/\`pop\`/\`peek\` and \`addFirst\`/\`removeFirst\`/\`peekFirst\` are the same three
methods on \`ArrayDeque\`. Use the stack names when the thing is a stack — the
names are the documentation.

## Working one from the sheet

[Asteroid Collision](problem:asteroid-collision). Non-zero integers: size is the
absolute value, sign is the direction, positive moves right. Asteroids moving
towards each other collide, the smaller is destroyed, equal sizes destroy both.
Return what survives.

A collision only happens when a right-mover is followed by a left-mover. So walk
the array holding the survivors so far on a stack. A new asteroid is safe unless
it moves left and the top moves right — and then it fights, possibly several
times, because destroying the top exposes another right-mover behind it.

\`\`\`text
a = [5, 10, -5]                     a = [8, -8]
 5   nothing to fight   stack: 5     8                   stack: 8
10   moving right       stack: 5 10 -8   equal sizes     stack:      both destroyed
-5   fights 10, loses   stack: 5 10
\`\`\`

\`\`\`java Asteroids.java @run-stacks-asteroids
import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Asteroids {

    static int[] survivors(int[] a) {
        Deque<Integer> st = new ArrayDeque<>();   // survivors so far, in order
        for (int x : a) {
            boolean alive = true;
            // Only a left-mover meeting a right-mover collides.
            while (alive && x < 0 && !st.isEmpty() && st.peek() > 0) {
                int top = st.peek();                   // unbox once, then compare as ints
                if (top < -x) st.pop();                // the top loses, keep fighting
                else if (top == -x) { st.pop(); alive = false; }   // both die
                else alive = false;                    // the top wins
            }
            if (alive) st.push(x);
        }
        int[] out = new int[st.size()];
        for (int i = out.length - 1; i >= 0; i--) out[i] = st.pop();   // the stack is reversed
        return out;
    }

    public static void main(String[] args) {
        int[][] tests = { { 5, 10, -5 }, { 8, -8 }, { 10, 2, -5 }, { -2, -1, 1, 2 }, { 1, -2, -2, -2 } };
        for (int[] t : tests)
            System.out.printf("%-16s -> %s%n", Arrays.toString(t), Arrays.toString(survivors(t)));
    }
}
\`\`\`

\`\`\`output @run-stacks-asteroids
[5, 10, -5]      -> [5, 10]
[8, -8]          -> []
[10, 2, -5]      -> [10]
[-2, -1, 1, 2]   -> [-2, -1, 1, 2]
[1, -2, -2, -2]  -> [-2, -2, -2]
\`\`\`

Two details carry it. The \`while\` runs more than once because one big left-mover
can clear several right-movers. And the output is filled **backwards**, because
popping gives the last survivor first — the same reversal that makes printing a
stack confusing, met head on. \`{ -2, -1, 1, 2 }\` is the case to check by hand:
nothing ever collides, because the left-movers are all to the left of the
right-movers.

## How to work through the topic

1. [Valid Parentheses](problem:valid-parentheses),
   [Remove Outermost Parentheses](problem:remove-outermost-parentheses),
   [Baseball Game](problem:baseball-game). The pile, and nothing else. Get both
   failure modes right in the first one.
2. [Remove All Adjacent Duplicates In String](problem:remove-all-adjacent-duplicates-in-string),
   [Backspace String Compare](problem:backspace-string-compare),
   [Simplify Path](problem:simplify-path). A stack as an editable buffer: push,
   and pop when the new thing cancels the old one.
3. [Next Greater Element I](problem:next-greater-element-i),
   [Daily Temperatures](problem:daily-temperatures),
   [Final Prices With a Special Discount in a Shop](problem:final-prices-with-a-special-discount-in-a-shop).
   The monotonic stack three times, with the answer wanted as a value, a
   distance and a difference. Write the loop from memory by the third.
4. [Min Stack](problem:min-stack),
   [Design a Stack With Increment Operation](problem:design-a-stack-with-increment-operation),
   [Online Stock Span](problem:online-stock-span). Design questions: what do you
   store alongside each element so the query stays O(1)?
5. [Evaluate Reverse Polish Notation](problem:evaluate-reverse-polish-notation),
   [Decode String](problem:decode-string),
   [Basic Calculator II](problem:basic-calculator-ii). Parsing. Push the pending
   context, resolve it on the closing token.
6. [Next Greater Element II](problem:next-greater-element-ii),
   [Asteroid Collision](problem:asteroid-collision),
   [Remove K Digits](problem:remove-k-digits),
   [132 Pattern](problem:132-pattern). The monotonic stack when the array is
   circular, when elements destroy each other, and when you are building the
   smallest result greedily.
7. [Largest Rectangle in Histogram](problem:largest-rectangle-in-histogram),
   [Sum of Subarray Minimums](problem:sum-of-subarray-minimums),
   [Trapping Rain Water](problem:trapping-rain-water),
   [Longest Valid Parentheses](problem:longest-valid-parentheses). Previous
   smaller and next smaller as a pair of bounds. Give the histogram a full hour
   and derive the sentinel yourself; the other three fall out of it.
`;export{e as default};