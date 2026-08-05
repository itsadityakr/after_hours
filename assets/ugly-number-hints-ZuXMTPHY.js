var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Write down your answer for these five: 1, 6, 8, 14, 0. Two of them are the ones
people get wrong, and if you are unsure about either then the definition is what
you are stuck on rather than the code.

## 1. Read the definition twice

"Whose prime factors are **limited to** 2, 3 and 5." That is not the same as
"contains 2, 3 and 5".

Ask yourself whether 8 qualifies, given it has no 3 and no 5 anywhere in it. Your
answer decides whether you are about to write the right method.

## 2. Turn it into a question about what is left over

You cannot easily ask "does this number have a prime factor other than 2, 3 or
5" — that would mean finding its factors. But you can **remove** the ones you are
allowed to have, and then look at what survives.

Say what a surviving value of 1 would mean. Say what a surviving value of 7 would
mean. That is the whole algorithm.

## 3. Removing a factor is not one division

Try your idea on 8 by hand. Divide by 2 once and you have 4, which is not 1 —
would your method reject it?

A factor can appear many times, so "take out the 2s" is a loop, not a step. This
is the mistake that passes 6, 10, 15 and 30 and fails only on numbers with a
repeated factor.

## 4. Do the three factors need separate code?

You need the same "keep dividing while it goes in" behaviour for 2, then 3,
then 5. Write it once and drive it with the three values rather than pasting it
three times — you will be glad of that if a fourth factor ever turns up.

## 5. The leftover test

At the end you compare the survivor against one specific number. Work out which.

It is not 0 — that never happens. It is not a check against 2, 3 or 5. It is the
value that means "nothing was left", and there is exactly one number that means
that.

## 6. Now the inputs outside the definition

The constraints allow negative numbers and zero. Neither is ugly.

Zero deserves a moment on its own: think about what your inner loop does when \`n\`
is 0 and you try to divide it by 2. The answer is not "it returns the wrong
thing".

## 7. Check 1 last

Run your finished method on 1. If it says \`false\`, look at where that came from —
you have probably written a check that requires a factor to have been removed,
and 1 has none to remove. The correct answer is \`true\`, and the right code gets
there without a special case.

## 8. If none of that was enough

The method, a dry run of 30 against 14, why \`while\` and not \`if\`, and what the
"nth ugly number" follow-up needs instead are on the **Notes** tab.
`;export{e as default};