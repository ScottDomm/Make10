from itertools import combinations_with_replacement
import itertools
import csv  # Import Python's CSV library
import json


def generate_combinations():
    combinations = list(combinations_with_replacement(range(10), 4))
    return [list(combination) for combination in combinations]


def generate_expressions(numbers, operators):
    number_permutations = list(itertools.permutations(numbers))
    operator_combinations = list(itertools.product(operators, repeat=3))

    valid_expressions = []

    for num_perm in number_permutations:
        for op_comb in operator_combinations:
            expression = f"( ( {num_perm[0]} {op_comb[0]} {num_perm[1]} ) {op_comb[1]} {num_perm[2]} ) {op_comb[2]} {num_perm[3]}"
            try:
                if eval(expression) == 10:
                    valid_expressions.append(expression)
            except ZeroDivisionError:
                continue

    return valid_expressions


combinations = generate_combinations()
operators = ['+', '-', '/', '*', '**']

numbers = [3, 1, 0, 2]

print(generate_expressions(numbers, operators))

i = 1

with open('valid_expressions.csv', 'w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Numbers", "Count of valid expressions"])

    for numbers in combinations:
        print(i)
        i = i+1
        count = len(generate_expressions(numbers, operators))
        writer.writerow([numbers, count])

# Open the CSV
# with open('valid_expressions.csv', 'r') as f:
#    # Parse the CSV into a dictionary
#    reader = csv.DictReader(f)
#    rows = list(reader)

# Write the data to a JSON file
# with open('valid_expressions.json', 'w') as f:
#    json.dump(rows, f)
