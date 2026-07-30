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
loop is the way without allocating — write the easy one first, then look at what
it cost.

## Both versions

\`\`\`java Max69.java @run-max69
public class Max69 {

    static int byReplace(int num) {
        return Integer.parseInt(String.valueOf(num).replaceFirst("6", "9"));
    }

    static int byChars(int num) {
        char[] arr = String.valueOf(num).toCharArray();

        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == '6') {
                arr[i] = '9';
                break; // only one change needed
            }
        }

        return Integer.parseInt(new String(arr));
    }

    public static void main(String[] args) {
        for (int n : new int[] { 9669, 9996, 9999, 6, 66 })
            System.out.printf("%5d   replaceFirst %-5d  char[] %d%n", n, byReplace(n), byChars(n));
    }
}
\`\`\`

\`\`\`output @run-max69
 9669   replaceFirst 9969   char[] 9969
 9996   replaceFirst 9999   char[] 9999
 9999   replaceFirst 9999   char[] 9999
    6   replaceFirst 9      char[] 9
   66   replaceFirst 96     char[] 96
\`\`\`

**\`replaceFirst\` is the shortest correct answer** and it says what the algorithm
is in one line — *first six becomes a nine*. The \`First\` is doing real work
there: \`replace\` would raise every 6 and answer 9999 for 9669, which is a
different problem and a wrong one.

Two things to know rather than to fear. It takes a **regular expression**, not a
plain string, so a pattern with \`.\` or \`*\` in it would not mean what it looks
like — \`"6"\` is safe, but the habit of forgetting is not. And it compiles that
pattern on every call, which is the kind of cost you would notice in a loop and
never notice here.

**The \`char[]\` version is the one to write in an interview**, because it shows
the reasoning rather than delegating it. \`break\` is the whole of step 3 — without
it the loop raises every 6 and you are back to the wrong answer. \`9999\` never
enters the body at all and falls out unchanged, which is the "no 6" case handled
by doing nothing.

## Without building a string

Neither version needs text, and the version that does not is a digit loop with
place value in it: walk the digits, remember where the leftmost 6 was, then add
\`3 × 10^position\` — turning a 6 into a 9 *is* adding three at that place.

It is more code and the same time, and its only real advantage is memory —
O(1) instead of the O(log n) below. Reach for it when a follow-up asks.

## Time — O(log n)

Every version here reads the digits once. A number has about \`log10\` of it
digits, so that is O(log n) — and for an \`int\` it is never more than ten steps,
which is why all three are the same speed in practice.

![One pass over the digits, so the work rises with the digit count](diagrams/maximum-69-number-notes-time.jpg)

## Space — O(log n)

This is where the string shows up. \`String.valueOf\` builds one, \`toCharArray\`
copies it, and \`new String(arr)\` builds a third — each of them as long as the
number has digits.

![The string and the char array growing in step with the digits](diagrams/maximum-69-number-notes-space.jpg)

| | Time | Space |
|---|---|---|
| \`replaceFirst\` | O(log n) | O(log n) — string, plus a compiled pattern |
| \`char[]\` | O(log n) | O(log n) — string and array |
| Digit loop | O(log n) | O(1) |
`;export{e as default};