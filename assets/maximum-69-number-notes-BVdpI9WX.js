var e=`A number made only of sixes and nines. Change **at most one** digit — a 6 to a 9
or a 9 to a 6 — to make it as large as you can. It sounds like it offers a
choice. It does not, and seeing that is the whole problem.

## 1. The problem

Given a positive integer \`num\` consisting only of the digits 6 and 9, return the
maximum number you can get by changing at most one digit.

- **In** — \`num\`, an \`int\`, \`1 <= num <= 10⁴\`, and every digit is a 6 or a 9.
- **Out** — the largest number reachable by changing at most one digit.
- **At most one** — you may also change nothing.

Two things fall out of "maximum" before any code is written.

**Turning a 9 into a 6 makes the number smaller**, so that half of the allowed
moves is never taken. The only question left is which 6 to raise.

**"At most one" covers doing nothing**, which is what 9999 needs — there is no 6
to raise, and the answer is the input unchanged. A solution that searches and
finds nothing must hand the number back rather than fail.

## 2. The brute force

Treat the number as text, find the first 6, replace it, and turn it back.

\`\`\`java Max69Replace.java @run-maximum-69-number-max69-replace
static int maximum69Number(int num) {
    return Integer.parseInt(String.valueOf(num).replaceFirst("6", "9"));
}
\`\`\`

\`\`\`output @run-maximum-69-number-max69-replace
maximum69Number(9669) -> 9969
maximum69Number(9996) -> 9999
maximum69Number(9999) -> 9999
maximum69Number(6)    -> 9
maximum69Number(66)   -> 96
maximum69Number(6666) -> 9666
\`\`\`

\`\`\`demo Max69Replace.java
maximum69Number(9669)
maximum69Number(9996)
maximum69Number(9999)
maximum69Number(6)
maximum69Number(66)
maximum69Number(6666)
\`\`\`

### The code, line by line

- \`String.valueOf(num)\` — the number as text, so the digits can be addressed
  individually. This is the step that makes the one-liner possible and also the
  step that costs something; section 4 is about that.
- \`.replaceFirst("6", "9")\` — **\`First\` is load-bearing.** Plain \`replace\` would
  raise *every* 6 and answer 9999 for 9669, which is a different problem and a
  wrong one. You are allowed one change.
- It takes a **regular expression**, not a plain string. \`"6"\` happens to mean
  itself, but the habit matters: a pattern containing \`.\` or \`*\` would not mean
  what it looks like.
- \`Integer.parseInt(...)\` — back to a number, because the signature says \`int\`.
- If there is no 6 at all, \`replaceFirst\` finds nothing, returns the text
  unchanged, and \`parseInt\` gives back the original number. **The "change
  nothing" case is handled by the method doing nothing.**

## 3. Dry run of the brute force

First the decision the code is making without showing its working. \`num = 9669\`,
and these are the only two moves worth considering:

| position | digit | place value | raise it to 9 | number becomes | gain |
|---|---|---|---|---|---|
| 0 | 9 | 9000 | — | — | lowering it loses 3000 |
| 1 | **6** | 600 | 900 | **9969** | **+300** |
| 2 | 6 | 60 | 90 | 9699 | +30 |
| 3 | 9 | 9 | — | — | lowering it loses 3 |

**The leftmost 6 wins, and no comparison is needed to know it.** Place value
decides: a 6 further left is worth ten times one further right, so raising it
gains ten times as much. That is why the algorithm is "find the first 6, change
it, stop" and not "try each 6 and keep the best".

Now the code itself on the same input:

| step | value | type |
|---|---|---|
| in | \`9669\` | \`int\` |
| \`String.valueOf\` | \`"9669"\` | \`String\` |
| \`replaceFirst("6", "9")\` | \`"9969"\` | \`String\` — only the first 6 moved |
| \`Integer.parseInt\` | \`9969\` | \`int\` |

![3. Dry run of the brute force — diagram](diagrams/maximum-69-number-notes-mm-1.jpg)

And the input with nothing to do, \`num = 9999\`:

| step | value |
|---|---|
| \`String.valueOf\` | \`"9999"\` |
| \`replaceFirst\` | \`"9999"\` — no match, so the text is returned unchanged |
| \`parseInt\` | **9999** |

No branch, no guard, no failure. **The "at most one" in the problem statement is
satisfied by a method that sometimes changes nothing.**

## 4. Why it is not enough

It is correct, it is one line, and it is the answer most worth writing first. But
it is doing a lot of work you did not ask for, and an interviewer will ask what.

**It allocates two strings.** One for the number, one for the replacement. For a
four-digit input that is nothing; the point is that the algorithm itself needs no
memory at all beyond a couple of integers, and this version needs memory
proportional to the number of digits.

**It compiles a regular expression on every call.** \`replaceFirst\` takes a
pattern, and a pattern has to be parsed before it can be matched. That is a real
cost, and it is the sort you would notice immediately if this ran inside a loop.

**It reaches for text to solve an arithmetic problem.** The digits are already
available through \`% 10\` and \`/ 10\` — the same pair every other digit problem on
this sheet uses — so the conversion is a detour, not a necessity.

The version an interviewer is steering you towards keeps everything in \`int\`:
walk the digits from the right, remember the **position** of the last 6 you saw
(which is the leftmost one, because you are going right to left), and at the end
add \`3\` multiplied by that position's place value — because raising a 6 to a 9
adds exactly 3 in that column. O(log num) time, O(1) space, no allocation, no
regex.

Work out why "the last 6 seen while walking right to left" is the same digit as
"the first 6 from the left", and you have that solution.

## 5. Key takeaways

- **"Maximum" throws away half the moves before you write anything.** Lowering a
  9 can never help, so the only question is which 6 to raise.
- **Place value answers "which one" without a comparison.** The leftmost 6 gains
  ten times what the next one does, so it always wins — no scanning for the best
  candidate.
- **\`replaceFirst\`, never \`replace\`.** The problem allows one change; \`replace\`
  makes all of them and is a different question.
- **"At most one" includes zero.** 9999 must come back unchanged, and the
  cleanest solutions handle it by not having a special case at all.
- **Raising a 6 to a 9 adds exactly 3 in that column** — that is what turns this
  into pure arithmetic and removes both the strings and the regex.
- **Converting a number to text to reach its digits is a detour.** \`% 10\` and
  \`/ 10\` are already there.
`;export{e as default};