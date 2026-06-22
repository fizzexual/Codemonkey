window.CODE_SNIPPETS = window.CODE_SNIPPETS || {};
window.CODE_SNIPPETS["sprout"] = [

`show sum([x * x for each x in 1 to 1000000])`,

`task fib(n):
    when n < 2:
        give n
    give fib(n - 1) + fib(n - 2)
show fib(30)`,

`make xs = []
make i = 0
repeat 500000 times:
    add(xs, i)
    set i += 1
show length(xs)`,

`make total = 0
repeat 5000000 times:
    set total += 1
show total`,

`make m = {}
make i = 0
repeat 20000 times:
    set m["k" + i] = i
    set i += 1
show length(keys(m))`,

`make xs = reverse(1 to 100000)
show first(sort(xs))`,

`make s = ""
repeat 30000 times:
    set s += "x"
show length(s)`

];