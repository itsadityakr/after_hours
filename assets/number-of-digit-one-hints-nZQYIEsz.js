var e=`The loop you would write first is correct and far too slow, and no amount of
tuning it helps. These hints spend their time on the change of question that
makes the fast version obvious, and then on the two places it is usually got
wrong by one.

## Before any hint at all

Write down the answers to these three by hand, counting characters rather than
numbers:

\`\`\`text
n = 10        n = 11        n = 20
\`\`\`

If 11 came out worth one, read the title again. The question is how many times
the digit is *written*, and 11 writes it twice.

## 1. The version that is obviously right

Write the loop that walks 1 to n and takes each number apart. Four or five lines,
no cleverness, and it is correct.

Submit it. Everything below is an argument with something that exists, and it is
also the thing you will check the fast version against.

## 2. Put a number on why it fails

Add a counter to the inner loop and print it for n = 1000000. Then work out —
on paper, not by running it — what that counter would reach for the largest n the
statement allows.

Compare against a few hundred million operations a second. That is the budget you
have just blown, and by how much.

## 3. Ask a different question

Your loop asks each *number* what digits it contains. Nothing it learns from 1000
helps it with 1001, which is why there are a billion of them.

Write out the last digit of the numbers 1 to 30, in three rows of ten. Say in one
sentence how many 1s appear in that column per row, and whether the answer
depends on which row.

Now do the same for the tens digit of 1 to 300, in rows of a hundred.

## 4. One column at a time

Fix a single column — say the hundreds — and forget the rest of the problem.

Split \`n\` into the three pieces that column creates: what is above it, the digit
in it, and what is below it. For \`n = 1234\` and the hundreds column, write all
three down as numbers.

Then write each as an expression in \`n\` and the column's place value. There are
three of them and each is one operator or two.

## 5. Count the numbers that put a 1 in that column

A number in range with a 1 in that column looks like this:

\`\`\`text
        H     1     L
     above  fixed  below
\`\`\`

For \`H\` fixed at some value below the top, \`L\` is free. How many values can \`L\`
take? Multiply. That is your first term, and it is the easy one.

## 6. Now the block that got cut off

The \`H\` above cannot always run all the way to its top value, because \`n\` stops
where it stops. So the last block is partial, and how much of it counts depends
on one thing only.

Write down what happens to that final block when the digit in the column is 0,
when it is 1, and when it is 5. Three answers, and two of them are simple.

## 7. The one that is not simple

Take \`n = 1234\` and the thousands column. List the actual numbers with a 1 there.

Count them. Now compare that count against the value of the "below" piece you
worked out in hint 4. They differ by one, and you should be able to say why in
terms of a range that includes both of its ends.

This is where nearly every wrong submission of this problem is wrong.

## 8. Assemble it

Three branches, a running total, and a place value that multiplies by ten each
turn. Say how many turns the whole loop takes for the largest allowed \`n\` before
you write it.

Then check it against your loop from hint 1 for every n from 0 to 2000. Not a
handful of cases — all of them. This is a problem where an off-by-one hides
perfectly in spot checks.

## 9. Types, and the two places they bite

Your place value multiplies by ten every turn, and inside the loop you also form
ten times it. Work out what the second of those reaches on the last turn for
n = 10⁹, and whether that value fits in an \`int\`.

Then a separate question about the total: what is the largest answer the stated
range can produce, what would the answer be for \`Integer.MAX_VALUE\`, and if your
accumulator is an \`int\`, why did the compiler not stop you?

## 10. If none of that was enough

The column split drawn, the three branches side by side, both dry runs in full,
and a straight answer about what \`+=\` does to a \`long\` are on the **Notes** tab.
`;export{e as default};