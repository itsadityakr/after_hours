var e=`Read one, close the page, and go back to the editor. They are in order, and the
last one before the notes is still not the answer.

## Before any hint at all

Do 12345 by hand. Then do 999. Then do 7. Watching your own hand stop is how you
find the stopping rule, and the stopping rule is the part people get wrong.

## 1. There are two different loops here

One of them takes a number apart digit by digit and adds the digits up. The
other one does that **again** if the result still has more than one digit. They
are not the same loop and neither is optional — write them as two, one inside
the other, rather than trying to be clever with one.

## 2. The inner loop is the one you already know

Last digit, then drop the last digit, until there is nothing left. Two lines,
both of them a division by ten — one keeping the remainder and one throwing it
away. If that is not automatic yet, the topic's own notes teach it before this
problem uses it.

## 3. When does the outer loop stop?

Not "when the number is small". Say the condition in the words the question
uses: keep going **while the result still has more than one digit**. Now write
that as a comparison against a number. It is one comparison and there is only
one number it can be.

Check what your condition does when the input is already a single digit — 7
should come back as 7 without either loop running at all, and 0 should come back
as 0.

## 4. The variable that catches people

Your inner loop needs somewhere to add the digits up. Ask where that variable is
declared: if it is outside the outer loop, what is in it when the second round
starts? Work through 999 with your own code and watch that variable.

## 5. Watch what happens to the number itself

The inner loop destroys the number it is given — by the end it is zero. So the
outer loop has to put something back before it goes round again. What is the
only thing the next round needs?

## 6. The follow-up, if you have solved it

You will be asked to do it without a loop. Do not go looking for the trick:
compute the answer for 1 through 20 with the code you have just written, put the
results in a column, and look at it. The pattern is not subtle once it is in
front of you, and the reason it holds has to do with what a remainder by nine
does to a number and to its digit sum.

## 7. If none of that was enough

The two loops, why \`sum\` lives where it does, the three passes an \`int\` can
need, and the O(1) formula with the reason it works are on the **Notes** tab.
`;export{e as default};