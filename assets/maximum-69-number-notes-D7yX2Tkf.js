var e=`A number made only of sixes and nines. Change **at most one** digit — a 6 to a 9
or a 9 to a 6 — to make it as large as you can. The instruction sounds like it
offers a choice; it does not, and seeing that is the whole problem.

## How to approach it

**1. Throw away half the options immediately.** Turning a 9 into a 6 makes the
number smaller. You are maximising, so that move is never taken. The only
question left is which 6 to raise.

**2. Ask which digit position is worth the most.** In 9669 the two sixes are
worth 600 and 60. Raising the first gains 300; raising the second gains 30. The
leftmost 6 is always the best one, because place value says so — no comparison
between candidates is needed.

![The leftmost six being raised to a nine, and what each position would have gained](diagrams/maximum-69-number-notes-leftmost.jpg)

**3. So the algorithm is: find the first 6, change it, stop.** "At most one"
also covers the case where there is no 6 at all, and a solution that scans and
finds nothing must return the number unchanged rather than fail.

**4. Then decide how to reach the digits.** Text is the easy way and the digit
loop is the way without allocating — the three versions below are those two and
the one in between.

## Approach 1 — let the library find it

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
\`\`\`

\`\`\`demo Max69Replace.java
maximum69Number(9669)
maximum69Number(9996)
maximum69Number(9999)
maximum69Number(6)
maximum69Number(66)
\`\`\`

**The shortest correct answer**, and it says what the algorithm is in one line —
*first six becomes a nine*. The \`First\` is doing real work there: \`replace\`
would raise every 6 and answer 9999 for 9669, which is a different problem and a
wrong one.

Two things to know rather than to fear. It takes a **regular expression**, not a
plain string, so a pattern with \`.\` or \`*\` in it would not mean what it looks
like — \`"6"\` is safe, but the habit of forgetting is not. And it compiles that
pattern on every call, which is the kind of cost you would notice in a loop and
never notice here.

## Approach 2 — scan the characters yourself

\`\`\`java Max69Chars.java @run-maximum-69-number-max69-chars
static int maximum69Number(int num) {
    char[] digits = String.valueOf(num).toCharArray();

    for (int i = 0; i < digits.length; i++) {
        if (digits[i] == '6') {
            digits[i] = '9';
            break; // only one change is allowed, and only one is wanted
        }
    }

    return Integer.parseInt(new String(digits));
}
\`\`\`

\`\`\`output @run-maximum-69-number-max69-chars
maximum69Number(9669) -> 9969
maximum69Number(9996) -> 9999
maximum69Number(9999) -> 9999
maximum69Number(6)    -> 9
maximum69Number(66)   -> 96
\`\`\`

\`\`\`demo Max69Chars.java
maximum69Number(9669)
maximum69Number(9996)
maximum69Number(9999)
maximum69Number(6)
maximum69Number(66)
\`\`\`

**This is the one to write in an interview**, because it shows the reasoning
rather than delegating it. \`break\` is the whole of step 3 — without it the loop
raises every 6 and you are back to the wrong answer. 9999 never enters the body
at all and falls out unchanged, which is the "no 6" case handled by doing
nothing.

## Approach 3 — without building a string

Neither version above needs text, and the one that does not is a digit loop with
place value in it: walk the digits from the right, remember where the last 6
was — which is the leftmost one in the number — then add three at that place.
Turning a 6 into a 9 *is* adding three there.

\`\`\`java Max69Digits.java @run-maximum-69-number-max69-digits
static int maximum69Number(int num) {
    int place = -1;

    for (int x = num, power = 1; x > 0; x /= 10, power *= 10)
        if (x % 10 == 6) place = power;

    return place < 0 ? num : num + 3 * place;
}
\`\`\`

\`\`\`output @run-maximum-69-number-max69-digits
maximum69Number(9669) -> 9969
maximum69Number(9996) -> 9999
maximum69Number(9999) -> 9999
maximum69Number(6)    -> 9
maximum69Number(66)   -> 96
\`\`\`

\`\`\`demo Max69Digits.java
maximum69Number(9669)
maximum69Number(9996)
maximum69Number(9999)
maximum69Number(6)
maximum69Number(66)
\`\`\`

**Reading right to left is what makes it one pass.** Every 6 overwrites the
remembered place, so the last one seen is the leftmost one in the number, and
there is no second scan and nothing to compare.

**\`place = -1\` is the "no 6 at all" case**, and it has to be a value no real
place can take. It is the same case 9999 exercises in approach 2, said with a
sentinel instead of with a loop that does nothing.

It is more code than the other two and the same time. Its only real advantage is
memory, and that is the whole reason to know it — reach for it when a follow-up
asks.

## What the three cost

**Time is the yellow line, memory the green one.** Every version here reads the
digits once; only the last one stops copying them first.

![Time and memory for all three versions on one pair of axes](diagrams/maximum-69-number-notes-cost.jpg)

| Approach | Time | Space | |
|---|---|---|---|
| 1 — \`replaceFirst\` | O(log n) | O(log n) — string, plus a compiled pattern | the one-liner |
| 2 — \`char[]\` | O(log n) | O(log n) — string and array | **write this one** |
| 3 — digit loop | O(log n) | O(1) | for the "no extra memory" follow-up |

A number has about \`log10\` of it digits, so one pass over them is **O(log n)** —
and for an \`int\` it is never more than ten steps, which is why all three are the
same speed in practice.

The memory is where they part. \`String.valueOf\` builds a string, \`toCharArray\`
copies it, and \`new String(digits)\` builds a third — each of them as long as the
number has digits. The digit loop builds none of them.
`;export{e as default};