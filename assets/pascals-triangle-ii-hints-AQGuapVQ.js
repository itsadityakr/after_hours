var e=`These assume [Pascal's Triangle](problem:pascals-triangle) is behind you. If it
is, the first two are revision and the problem really starts at hint 3.

## Before any hint at all

What does \`getRow(3)\` return, and how many numbers are in it? Write the row out.
If you answered three, read the examples again — this problem indexes rows where
part I counted them, and every loop bound on the page turns on that.

## 1. Start from the answer you already have

Build every row up to \`rowIndex\` and return the last one. That is part I with a
\`get\` on the end, it is correct, and it passes.

Write it and submit it before going further. Everything below is about what it
kept, and the argument is easier to follow when the thing being argued with is on
your own screen.

## 2. Count what it is holding when it returns

Add up how many numbers live in rows 0 to 33 together. Then compare that with how
many you were asked for. It is not close, and the ratio is the whole of the
follow-up question.

## 3. How long is any one row actually useful?

Pick a row in the middle — row 5, say. Which turn writes it? Which turn reads it?
Which turn reads it a second time?

Answer those three and you know how many rows have to be alive at once. It is a
much smaller number than the one you counted in hint 2.

## 4. Write the update out as reads and writes

Forget lists for a moment. The new value at position \`j\` is built from two old
values. Write down which two positions those are.

One of them is \`j\` itself. The other is on one particular side of it — and that
side is the only fact you need for the rest of this problem.

## 5. So one row can overwrite itself, in one direction

If a single list is going to become the next row in place, then at the moment you
write position \`j\`, the two positions you still have to read must not have been
written yet.

Given your answer to hint 4, there is exactly one direction of travel that
guarantees that. Work it out on row 4 by hand, four cells, before you code it.

## 6. Run the other direction on purpose

Write the wrong sweep and print what it gives you for row 3, row 4 and row 5. It
does not throw and the lengths are right. Look at the numbers and find the
property every real row of this triangle has that these have lost.

Being able to recognise that failure by eye is worth more than remembering which
way the loop goes.

## 7. Two details at the ends

Where does the new right-hand \`1\` come from, and does it go on before or after
the sweep? And there is one index the inner loop must never touch — say which,
and what would happen if it did.

## 8. The version that needs no previous row at all

Row \`rowIndex\` is a list of "how many ways to choose \`j\` things out of
\`rowIndex\`". Consecutive entries are one multiply and one divide apart, so a
single running value can walk the whole row from its leading 1, left to right.

Multiply before you divide. The other order truncates.

## 9. Now check the size of that multiplication

Every number in row 33 fits in an \`int\` — the constraints were chosen so that it
does. But the product you form in the middle of that step, before the division
brings it back down, is not one of the numbers in row 33.

Write the step with an \`int\` accumulator and again with a \`long\` one, and compare
the two rows index by index at \`rowIndex = 33\`. Then try 29 and see why part I
never noticed.

## 10. If none of that was enough

The three versions, why the sweep direction is the whole problem, what the wrong
direction prints, and where the overflow lands are on the **Notes** tab.
`;export{e as default};