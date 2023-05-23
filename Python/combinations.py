from itertools import combinations_with_replacement
import itertools
import csv  # Import Python's CSV library
import gc  # Import Python's garbage collector
import sys

# define the 5 operations
ops = ['+', '-', '/', '*', '**']


def generate_equations(nums):
    for num_permutation in itertools.permutations(nums):
        for ops_combination in itertools.product(ops, repeat=3):
            equation = [str(num_permutation[0])]
            for i, op in enumerate(ops_combination):
                equation.append(' ' + op + ' ')
                equation.append(str(num_permutation[i+1]))
            yield ''.join(equation)


def add_parentheses(equation):
    equation_with_parentheses = []
    groups = equation.split(" ")
    for i in range(4):
        if i == 0:
            equation_with_parentheses.append(''.join(groups))  # no parentheses
        elif i == 1:
            equation_with_parentheses.append('(({} {} {}) {} {} {} {})'.format(
                groups[0], groups[1], groups[2], groups[3], groups[4], groups[5], groups[6]))  # parentheses around the first operation
        elif i == 2:
            equation_with_parentheses.append('({} {} ({} {} {}) {} {})'.format(
                groups[0], groups[1], groups[2], groups[3], groups[4], groups[5], groups[6]))  # parentheses around the second operation
        elif i == 3:
            equation_with_parentheses.append('({} {} {} {} ({} {} {}))'.format(
                groups[0], groups[1], groups[2], groups[3], groups[4], groups[5], groups[6]))  # parentheses around the third operation
    return equation_with_parentheses


def generate_combinations():
    combinations = list(combinations_with_replacement(range(10), 4))
    return [list(combination) for combination in combinations]


def find_equations(nums):
    valid_equations = []
    for equation in generate_equations(nums):
        equations_with_parentheses = add_parentheses(equation)
        for equation in equations_with_parentheses:
            if "/ 0" in equation:
                continue
            try:
                if eval(equation) == 10:
                    valid_equations.append(equation)
            except ZeroDivisionError:
                pass  # skip division by zero
    return valid_equations


combinations = generate_combinations()
print("Total combinations:", len(combinations))

i = 1

with open('output.csv', 'w', newline='') as f:

    writer = csv.writer(f)
    # Write the headers
    writer.writerow(["Combination", "Number of Equations"])
    for y in combinations[162:]:
        print(f'\rProcessing {i}/715', end='')
        sys.stdout.flush()  # Make sure the output is immediately printed
        x = find_equations(y)
        # Write each row as [Combination, Number of Equations]
        writer.writerow([str(y), str(len(x))])

        i = i+1
        del x  # Explicitly delete x
        gc.collect()  # Call the garbage collector
