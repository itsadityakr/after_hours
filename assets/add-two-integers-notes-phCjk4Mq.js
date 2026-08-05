var e=`Two numbers, added. \`return num1 + num2;\` and it is finished. This is the
smallest problem on the sheet and it is here to prove the machinery works — that
you can read a signature, return the right type, and press submit.

## 1. The problem

Given two integers \`num1\` and \`num2\`, return their sum.

- **In** — \`num1\` and \`num2\`, both \`int\`, and \`−100 <= num1, num2 <= 100\`.
- **Out** — their sum, as an \`int\`.

**Read the constraints before deciding it is trivial**, because they are the
reason the trivial answer is the right one. Both inputs sit between −100 and 100,
so the sum is between −200 and 200 — a very long way inside what an \`int\` holds.

That sentence is worth saying out loud in an interview. "The constraints are
±100, so the sum fits in an \`int\`" costs nothing and tells the interviewer you
know what their next question is going to be.

## 2. The brute force

There is no trick, and looking for one is the only way to get this wrong.

\`\`\`java Sum.java @run-add-two-integers-sum
static int sum(int num1, int num2) {
    return num1 + num2;
}
\`\`\`

\`\`\`output @run-add-two-integers-sum
sum(12, 5)      -> 17
sum(-10, 4)     -> -6
sum(0, 0)       -> 0
sum(100, 100)   -> 200
sum(100, -100)  -> 0
sum(-100, -100) -> -200
\`\`\`

\`\`\`demo Sum.java
sum(12, 5)
sum(-10, 4)
sum(0, 0)
sum(100, 100)
sum(100, -100)
sum(-100, -100)
\`\`\`

### The code, line by line

- \`static int sum(int num1, int num2)\` — the signature, taken from the question.
  Two \`int\`s in, one \`int\` out.
- \`return num1 + num2;\` — \`+\` on two \`int\`s. Java's \`+\` on the integer types is
  exact **as long as the true answer fits in 32 bits**, and here the constraints
  guarantee it does: the largest possible result is 200 and the smallest −200.
- There is no guard, because there is nothing to guard against. Negative inputs
  need no special case — \`+\` handles the sign for you, which is what the demo's
  middle rows are checking.

## 3. Dry run of the brute force

There is no loop, so the dry run is the arithmetic itself and the range it lives
in.

| num1 | num2 | sum | inside ±200? |
|---|---|---|---|
| 12 | 5 | 17 | yes |
| −10 | 4 | −6 | yes |
| 0 | 0 | 0 | yes |
| 100 | 100 | **200** | the largest possible |
| 100 | −100 | 0 | yes |
| −100 | −100 | **−200** | the smallest possible |

Where those answers sit inside what an \`int\` can hold — the whole legal range of
this problem is the green sliver in the middle:

![3. Dry run of the brute force — diagram](diagrams/add-two-integers-notes-mm-1.jpg)

**The two green markers are ten million times closer to the middle than the two
amber ones.** That gap is the entire reason \`+\` is safe here, and it is also the
reason the next section exists — take the constraints away and the amber ends
start to matter.

## 4. Why it is not enough

For the question as asked, it is enough — there is no faster way to add two
numbers, and O(1) time and space is where it starts.

Two things sit behind it, and both get asked.

**The first is what happens outside the constraints.** \`+\` keeps its promise
about speed and quietly drops the one about arithmetic. Two numbers near the top
of the \`int\` range add up to something that is not in the \`int\` range, and Java
does not tell you — it wraps, and the answer comes back negative. That is not an
error condition, it is the defined behaviour of \`+\`, and it is why the
constraints on a problem are part of the problem. Doing the arithmetic in a
\`long\`, or using \`Math.addExact\` to be told rather than be wrong, are the two
fixes worth knowing.

**The second is the interview version: add without using \`+\`.** Every adder ever
built does it with two operations, and you already know both. Add 13 and 7 in
binary by hand, column by column, and write down two things per column: the digit
that stays, and the thing handed to the column on its left.

The digit that stays is one bitwise operator applied to the whole number. The
thing handed left is another one, shifted by one place. Those two lines plus a
loop that repeats until nothing is left to hand over is the whole method — and it
is exactly [Sum of Two Integers](problem:sum-of-two-integers), where \`+\` and \`-\`
are forbidden outright.

## 5. Key takeaways

- **Write the one line and take the tick.** Looking for a trick is the only way
  to fail this.
- **Quote the constraints as the justification.** ±100 means the sum fits in an
  \`int\` — a one-sentence proof that costs nothing and pre-empts the follow-up.
- **\`+\` wraps silently outside the range.** It is not an error, it is defined
  behaviour, and it is why the same trap makes
  [Palindrome Number](problem:palindrome-number) harder than it looks.
- **Negative inputs need no special case.** The sign is not a separate thing to
  handle.
- **The real question is adding without \`+\`** — one bitwise operator for the
  digit that stays, another for the carry, shifted left, repeated until the carry
  is zero.
`;export{e as default};