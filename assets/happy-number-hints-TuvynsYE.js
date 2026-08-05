var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Do 19 by hand: square its digits, add them, and repeat until you see what
happens. Then do 2, and keep going until you notice something. Both take under a
minute and the second one is the entire problem.

## 1. The part you already know how to write

Replacing a number by the sum of the squares of its digits is the digit loop
with one character changed: instead of adding the digit, add the digit times
itself. Write that as a method of its own before anything else — every version
of the solution needs it, and the last one is unreadable without it.

## 2. What actually goes wrong

Nothing goes wrong with 19: it reaches 1 and you return true. The problem is 2,
where the chain never reaches 1 — so a loop that waits for 1 waits forever, and
"forever" is not an answer you can submit.

## 3. There are only two endings, and that is provable

The chain cannot run off to infinity: a three-digit number squares-and-sums to
at most 243, so everything above that comes down and stays down. A chain that
lives in a finite set forever has to revisit a number it has already been at.

So: either it reaches 1, or it repeats. Two endings, no third.

## 4. So the whole problem is "spot the repeat"

You are not looking for a clever formula. You are looking for the cheapest way
to notice that you have stood on this number before. Write down every way you
can think of — there are three, and they are all reasonable.

## 5. The one that needs nothing but the definition

Keep the numbers you have visited. Before each step, ask whether the new one is
already in there. Which structure answers "have I seen this" in one operation,
and what does it cost you in memory?

This is the version to write first, and the one to write on a problem you have
never seen before.

## 6. The one that needs no memory at all

If a chain ends in a loop, then two walkers moving at different speeds through
it — one step at a time and two steps at a time — must eventually stand on the
same number. Work out why they meet at 1 as well when the number is happy, and
what that means for how you test the result.

Careful with where the loop starts: both walkers begin on the same value, so a
\`while\` that tests before the first move stops immediately.

## 7. The one that is fastest and hardest to justify

Every unhappy chain visits the same short ring of numbers. If you did the
by-hand work at the top you have already written part of that ring down. Testing
for one specific member of it replaces the whole set — and be ready to explain
why that is true, because the code does not.

## 8. If none of that was enough

All three versions, the ring that the second-fastest one relies on, why the
two-speed walk has to collide, and what the three cost in memory are on the
**Notes** tab.
`;export{e as default};