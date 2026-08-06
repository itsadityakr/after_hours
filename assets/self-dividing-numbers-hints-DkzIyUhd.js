var e=`Read one, close the page, go back to the editor. They are in order and they stop
before the answer.

## Before any hint at all

Decide by hand whether each of these is self-dividing: 128, 102, 15, 16, 31.

Two of the five are the ones that catch submissions, and you will meet both
below. If you got 31 wrong, read the definition once more before hint 1 — it is
about the whole number every time.

## 1. Write the definition as a sentence with no maths in it

Say out loud what has to be true of a number for it to belong in the answer. Then
count how many separate conditions your sentence contains.

There are two, not one. One of them is a divisibility test and the other is not a
test at all — it is a digit that must simply not be there. Getting those as two
things rather than one decides the shape of everything below.

## 2. The digit that is not a test

Take 102 and try to check it the obvious way, on paper, digit by digit.

At the middle digit, write down the expression you would evaluate. Then ask what
Java does with that expression. Not "what does it return" — ask whether it
returns.

If you are not sure, type it into a file and run it. The answer to this hint is
worth seeing rather than being told, because it is a different kind of failure
from a wrong answer and the message names the line.

## 3. So the order of two lines is a correctness question

You now have two checks per digit. Write them down in both orders and, for each
order, say what happens on the number 10.

One of the two orders is not slower, or uglier. It is broken, and it is broken on
the second-smallest two-digit input there is.

## 4. Now get at the digits

You need each digit of a number as a number. There are two ways: turn the number
into text and read it back, or use two operators.

Write the text version first if you like — it works, and it is the version the
Notes tab argues with. Then find the two operators. One of them gives you the
last digit; the other throws that digit away. Together they are a loop, and the
loop's stopping condition is something you do not have to write.

## 5. Say what stops the loop

Whichever way you got the digits, your loop ends. Say precisely what makes it
end.

If your answer involves counting the digits first, you have written more than you
need. With the two-operator version there is one comparison, it involves zero,
and a number with one digit satisfies it exactly once.

## 6. Two variables, and they are not interchangeable

Your loop destroys something as it goes. The definition is about something that
must not be destroyed.

Name both. Then go through your code and, at every place you wrote a variable,
ask which of the two it should be. There will be one line where you have to think
about it for more than a second, and that line is the whole hint.

## 7. Prove it to yourself on 128

Run the version you think is right, and then deliberately write the version where
that one line uses the other variable.

Both say 128 is self-dividing. Neither crashes. So 128 cannot tell them apart —
you need an input where the digits that get thrown away were the ones that
mattered.

Try 31. If you cannot see why it separates them, write the three lines out:
\`31 % 1\`, then what is left, then the second test each version performs.

## 8. Now the shell around it

The test is done. The rest is one pass over the range, keeping what passes.

Two small things to be sure of before you submit: whether both ends of the range
are included, and what the answer looks like when nothing in the range qualifies.
The constraints already answer the second one for you — say how.

## 9. The follow-up they will actually ask

The range here stops at 10⁴, so testing every candidate is fine. Suppose it
stopped at 10⁹ instead.

Go back to hint 1 and look at the condition that was not a test. Of the ten
digits, how many can appear in a self-dividing number? Now count how many
nine-digit candidates that leaves against how many there are in total.

That ratio is the answer to the follow-up, and it points at doing something other
than filtering. Say what you would build instead of what you would skip.

## 10. If none of that was enough

The zero-digit trap with the exception it throws, the two versions of the wrong
variable printed side by side, the dry run on 128 and 102, and what the text
version actually costs are on the **Notes** tab.
`;export{e as default};