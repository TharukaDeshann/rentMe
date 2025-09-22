# Problem 1: print numbers in the list until the 8
# numbers = [1, 3, 7, 8, 9, 12, 15]
# for num in numbers:
#     if num == 8:
#         break
#     print(num)
# print("Loop ended\n")

#Find the first number divisible by 5
# numbers = [1,4,9,8,3,15,34,60,22]
# for num in numbers:
#     if num % 5 == 0:
#         print(f"Found first number divisible by 5: {num}")
#         break

# Problem 3: Print all numbers in between 1 and 20 except those divisible by 3
# for num in range(1, 20):
#     if num % 3 == 0:
#         continue
#     print(num)

#Print all the characters in a string except the vowels
# string = "Hello, welcome to Python programming!"
# for char in string:
#     if char.lower() in 'aeiou':
#         continue
#     print(char)

# def funs(str):
    
#     for char in str:
#         if char.lower() in "aeiou":
#             continue
#         print(char, end = ' ')


# funs("Hello World")


# def is_even(num):
#     if(num%2 == 0):
#         return True
#     return False

# state = is_even(5)
# print(state)


# create a function to get addition of two numbers
# def add(num1, num2):
#     return num1 + num2  

# num1 = int(input("Insert number one : "))
# num2 = int(input("Insert number two : "))

# result = add(num1 , num2)
# print(result)

# x = 30
# def myfun(a):
#     global x
#     x = a + 5
#     return x
# result = myfun(x)
# print(x)

# str = "Hello World"

# print(str.split("l"))

# x = 1 
# y = 100 
# while (x < 100): 
#   y = y - x  
#   x = x + 1  
#   if (x + y) < 90: 
#     break 
# print (y) 



# s = 1  

# for i in range(1, 10): 
#   if (i < 5): 
#     s = s * i 
#   elif (i < 8): 
#     s = s - i 
#   else: 
#     s = s + i 
#     break 


# def add(num1,num2):
#     tot = num1 + num2
#     return tot

# result = add(5,10)
# print(result)

list = [12,32,2,45,32,15]
size = len(list)
for i in range(size):                                #[25,30,22,28]
	for j in range(i+1, size):
		if(list[i] > list[j]):
			temp = list[i]
			list[i] = list[j]
			list[j] = temp
print(list)

