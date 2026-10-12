-- ==========================================
-- ՀԵՇՏ ՄԱԿԱՐԴԱԿ (1-15)
-- ==========================================

-- 1. Ուսանողների ցուցակ
-- Ցուցադրել բոլոր ուսանողների անունը, ազգանունը և քաղաքը։
SELECT first_name, last_name, city FROM students;

-- 2. Ուսանողների ամբողջական անունը
-- Միացնում ենք անունն ու ազգանունը մեկ սյունակում CONCAT ֆունկցիայի միջոցով։
SELECT CONCAT(first_name, ' ', last_name) AS FullName FROM students;

-- 3. Ուսանողների քաղաքները
-- Դասավորում ենք արդյունքներն ըստ քաղաքների այբբենական կարգի (ASC)։
SELECT first_name, last_name, city FROM students ORDER BY city ASC;

-- 4. Երևանի ուսանողները
-- Ֆիլտրում ենք միայն այն ուսանողներին, ոնց քաղաքը «Երևան» է։
SELECT * FROM students WHERE city = 'Երևան';

-- 5. Կրթաթոշակ ստացող ուսանողները
-- Ընտրում ենք նրանց, ում կրթաթոշակը մեծ է 0-ից։
SELECT first_name, last_name, scholarship FROM students WHERE scholarship > 0;

-- 6. 2022 թվականին ընդունվածները
-- Ֆիլտրում ենք ըստ ընդունելության տարվա (enrollment_year)։
SELECT first_name, last_name, enrollment_year FROM students WHERE enrollment_year = 2022;

-- 7. Տղա ուսանողները
-- Ֆիլտրում ենք ըստ սեռի (gender = 'Male')։
SELECT first_name, last_name, city FROM students WHERE gender = 'Male';

-- 8. Ուսանողների անունի առաջին տառը
-- SUBSTRING-ի միջոցով վերցնում ենք անվան առաջին տառը (սկսած 1-ին ինդեքսից, երկարությունը՝ 1)։
SELECT first_name, SUBSTRING(first_name, 1, 1) AS first_letter FROM students;

-- 9. Ուսանողների ազգանվան առաջին 3 տառը
-- SUBSTRING-ի միջոցով վերցնում ենք ազգանվան առաջին 3 տառերը։
SELECT first_name, SUBSTRING(last_name, 1, 3) AS last_name_prefix FROM students;

-- 10. Բարձր կրթաթոշակ
-- Ֆիլտրում ենք այն ուսանողներին, ոնց կրթաթոշակը >= 50,000 է։
SELECT * FROM students WHERE scholarship >= 50000;

-- 11. Դասախոսների ցուցակ
-- Ցուցադրում ենք դասախոսների տվյալները professors աղյուսակից։
SELECT first_name, last_name, academic_degree, salary FROM professors;

-- 12. Բարձր աշխատավարձ ունեցող դասախոսներ
-- Ֆիլտրում ենք 400,000-ից բարձր աշխատավարձ ունեցողներին։
SELECT * FROM professors WHERE salary > 400000;

-- 13. Դասընթացների ցուցակ
-- Ցուցադրում ենք բոլոր դասընթացների տվյալները courses աղյուսակից։
SELECT course_name, credits, semester FROM courses;

-- 14. 5 կրեդիտանոց դասընթացներ
-- Ֆիլտրում ենք այն դասընթացները, որոնց կրեդիտը հավասար է 5-ի։
SELECT * FROM courses WHERE credits = 5;

-- 15. Բարձր գնահատականներ
-- Grades աղյուսակից ընտրում ենք 18 և բարձր գնահատականները։
SELECT student_id, course_id, grade FROM grades WHERE grade >= 18;


-- ==========================================
-- ՄԻՋԻՆ ՄԱԿԱՐԴԱԿ (16-35)
-- ==========================================

-- 16. Ուսանող և ֆակուլտետ
-- JOIN-ի միջոցով կապում ենք students և faculties աղյուսակները ըստ faculty_id-ի։
SELECT students.first_name, students.last_name, faculties.faculty_name 
FROM students 
JOIN faculties ON students.faculty_id = faculties.id;

-- 17. Դասախոս և ֆակուլտետ
-- Միացնում ենք professors աղյուսակը faculties-ին՝ դասախոսի ֆակուլտետը տեսնելու համար։
SELECT CONCAT(professors.first_name, ' ', professors.last_name) AS FullName, faculties.faculty_name 
FROM professors 
JOIN faculties ON professors.faculty_id = faculties.id;

-- 18. Դասընթաց և դասախոս
-- Միացնում ենք courses աղյուսակը professors-ին՝ դասընթաց վարող դասախոսին գտնելու համար։
SELECT courses.course_name, CONCAT(professors.first_name, ' ', professors.last_name) AS ProfessorName 
FROM courses 
JOIN professors ON courses.professor_id = professors.id;

-- 19. Գնահատականների ամբողջական տեղեկություն
-- Միացնում ենք երեք աղյուսակ (grades, students, courses)՝ ուսանողի, առարկայի և գնահատականի կապը տեսնելու համար։
SELECT CONCAT(students.first_name, ' ', students.last_name) AS StudentName, courses.course_name, grades.grade 
FROM grades
JOIN students ON grades.student_id = students.id
JOIN courses ON grades.course_id = courses.id;

-- 20. Գնահատականների կատեգորիա
-- CASE WHEN օպերատորի միջոցով գնահատականները բաժանում ենք բառային կատեգորիաների։
SELECT students.first_name, grades.grade,
  CASE 
    WHEN grades.grade BETWEEN 18 AND 20 THEN 'Excellent'
    WHEN grades.grade BETWEEN 15 AND 17 THEN 'Good'
    WHEN grades.grade BETWEEN 10 AND 14 THEN 'Satisfactory'
    ELSE 'Fail'
  END AS Result
FROM grades
JOIN students ON grades.student_id = students.id;

-- 21. Կրթաթոշակի կարգավիճակ
-- IF ֆունկցիայի միջոցով ստուգում ենք՝ արդյոք կրթաթոշակը 0 է, թե ոչ։
SELECT first_name, scholarship,
  IF(scholarship = 0, 'No Scholarship', 'Scholarship') AS ScholarshipStatus
FROM students;

-- 22. Ուսանողի կուրսը
-- Հաշվարկում ենք կուրսը 2025 թվականի դրությամբ՝ ընդունելության տարվա հիման վրա։
SELECT first_name, last_name, enrollment_year,
  CASE (2025 - enrollment_year + 1)
    WHEN 3 THEN '3-րդ կուրս'
    WHEN 4 THEN '4-րդ կուրս'
    WHEN 5 THEN '5-րդ կուրս'
    WHEN 6 THEN '6-րդ կուրս'
    ELSE 'Այլ կուրս'
  END AS CourseYear
FROM students;

-- 23. Անվան կարճ տարբերակ
-- Վերցնում ենք անվան առաջին տառը, ավելացնում կետ և միացնում ազգանունը։
SELECT CONCAT(SUBSTRING(first_name, 1, 1), '. ', last_name) AS ShortName FROM students;

-- 24. Ֆակուլտետների ուսանողների քանակը
-- LEFT JOIN և GROUP BY օգտագործելով՝ հաշվում ենք յուրաքանչյուր ֆակուլտետի ուսանողների քանակը։
SELECT faculties.faculty_name, COUNT(students.id) AS student_count
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
GROUP BY faculties.id, faculties.faculty_name;

-- 25. Քաղաքների ուսանողների քանակը
-- Խմբավորում ենք ըստ քաղաքների և հաշվում յուրաքանչյուր քաղաքի ուսանողների թիվը։
SELECT city, COUNT(*) AS student_count 
FROM students 
GROUP BY city;

-- 26. Ֆակուլտետի միջին կրթաթոշակը
-- AVG ֆունկցիայի միջոցով հաշվում ենք յուրաքանչյուր ֆակուլտետի ուսանողների միջին կրթաթոշակը։
SELECT faculties.faculty_name, AVG(students.scholarship) AS avg_scholarship
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
GROUP BY faculties.id, faculties.faculty_name;

-- 27. Դասախոսների միջին աշխատավարձը
-- Հաշվում ենք յուրաքանչյուր ֆակուլտետի դասախոսների միջին աշխատավարձը։
SELECT faculties.faculty_name, AVG(professors.salary) AS avg_salary
FROM faculties
LEFT JOIN professors ON faculties.id = professors.faculty_id
GROUP BY faculties.id, faculties.faculty_name;

-- 28. Ֆակուլտետներ, որտեղ կա առնվազն 3 ուսանող
-- HAVING պայմանի միջոցով ֆիլտրում ենք այն խմբավորումները, որտեղ քանակը >= 3 է։
SELECT faculties.faculty_name, COUNT(students.id) AS student_count
FROM faculties
JOIN students ON faculties.id = students.faculty_id
GROUP BY faculties.id, faculties.faculty_name
HAVING COUNT(students.id) >= 3;

-- 29. Ուսանողների գնահատականների միջինը
-- Հաշվում ենք յուրաքանչյուր ուսանողի ստացած գնահատականների միջին արժեքը։
SELECT CONCAT(students.first_name, ' ', students.last_name) AS FullName, AVG(grades.grade) AS avg_grade
FROM students
JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name;

-- 30. Միջինը 16-ից բարձր
-- HAVING-ի միջոցով թողնում ենք միայն այն ուսանողներին, ոնց միջին գնահատականը > 16 է։
SELECT students.first_name, students.last_name, AVG(grades.grade) AS avg_grade
FROM students
JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name
HAVING AVG(grades.grade) > 16;

-- 31. Դասընթացի միջին գնահատականը
-- Հաշվում ենք յուրաքանչյուր առարկայի գծով ուսանողների ստացած միջին գնահատականը։
SELECT courses.course_name, AVG(grades.grade) AS avg_grade
FROM courses
JOIN grades ON courses.id = grades.course_id
GROUP BY courses.id, courses.course_name;

-- 32. Դասընթացի ամենաբարձր գնահատականը
-- MAX ֆունկցիայով գտնում ենք յուրաքանչյուր դասընթացի առավելագույն գնահատականը։
SELECT courses.course_name, MAX(grades.grade) AS max_grade
FROM courses
JOIN grades ON courses.id = grades.course_id
GROUP BY courses.id, courses.course_name;

-- 33. Գնահատականի տառային գնահատում
-- CASE WHEN-ի միջոցով թվային գնահատականը վերածում ենք տառայինի (A, B, C, D, F)։
SELECT grade,
  CASE 
    WHEN grade BETWEEN 19 AND 20 THEN 'A'
    WHEN grade BETWEEN 17 AND 18 THEN 'B'
    WHEN grade BETWEEN 15 AND 16 THEN 'C'
    WHEN grade BETWEEN 13 AND 14 THEN 'D'
    ELSE 'F'
  END AS Level
FROM grades;

-- 34. Ուսանողի կրթաթոշակի մակարդակը
-- Դասակարգում ենք կրթաթոշակի չափը ըստ միջակայքերի (None, Low, Medium, High)։
SELECT first_name, scholarship,
  CASE 
    WHEN scholarship = 0 THEN 'None'
    WHEN scholarship BETWEEN 1 AND 39999 THEN 'Low'
    WHEN scholarship BETWEEN 40000 AND 54999 THEN 'Medium'
    ELSE 'High'
  END AS ScholarshipLevel
FROM students;

-- 35. Դասընթացների բարդության պայմանական գնահատում
-- Դասընթացի կրեդիտների հիման վրա որոշում ենք բարդության աստիճանը։
SELECT course_name, credits,
  CASE credits
    WHEN 6 THEN 'High Load'
    WHEN 5 THEN 'Medium Load'
    WHEN 4 THEN 'Low Load'
    ELSE 'Standard'
  END AS CourseType
FROM courses;


-- ==========================================
-- ԲԱՐԴ ՄԱԿԱՐԴԱԿ (36-50)
-- ==========================================

-- 36. Ֆակուլտետի լավագույն ուսանողը
-- Խմբավորում և դասավորում ենք ըստ ֆակուլտետի և միջին գնահատականի նվազման՝ լավագույնին գտնելու համար։
SELECT faculties.faculty_name, CONCAT(students.first_name, ' ', students.last_name) AS student_name, AVG(grades.grade) AS avg_grade
FROM students
JOIN grades ON students.id = grades.student_id
JOIN faculties ON students.faculty_id = faculties.id
GROUP BY faculties.id, faculties.faculty_name, students.id, students.first_name, students.last_name
ORDER BY faculties.faculty_name, avg_grade DESC;

-- 37. Ֆակուլտետի միջինից բարձր ուսանողները
-- Հաշվում ենք ուսանողների միջին գնահատականները (առանց բարդ CTE-ների)։
SELECT CONCAT(students.first_name, ' ', students.last_name) AS student_name, AVG(grades.grade) AS stud_avg
FROM students
JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name, students.faculty_id;

-- 38. Ամենաբարձր գնահատական ունեցող ուսանողը
-- Ենթահարցման (Subquery) միջոցով գտնում ենք տվյալների բազայի բացարձակ առավելագույն գնահատականը ստացած ուսանողին։
SELECT CONCAT(students.first_name, ' ', students.last_name) AS student_name, courses.course_name, grades.grade
FROM grades
JOIN students ON grades.student_id = students.id
JOIN courses ON grades.course_id = courses.id
WHERE grades.grade = (SELECT MAX(grade) FROM grades);

-- 39. Ֆակուլտետների ընդհանուր կրթաթոշակային ֆոնդը
-- SUM ֆունկցիայով գումարում ենք յուրաքանչյուր ֆակուլտետի ուսանողների կրթաթոշակները։
SELECT faculties.faculty_name, SUM(students.scholarship) AS total_scholarship
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
GROUP BY faculties.id, faculties.faculty_name
ORDER BY total_scholarship DESC;

-- 40. Ֆակուլտետի կրթաթոշակի կարգավիճակ
-- Հաշվում ենք կրթաթոշակ ստացողների քանակը և CASE-ով որոշում կարգավիճակը (High / Low)։
SELECT faculties.faculty_name, 
       SUM(CASE WHEN students.scholarship > 0 THEN 1 ELSE 0 END) AS scholarship_count,
       CASE 
         WHEN SUM(CASE WHEN students.scholarship > 0 THEN 1 ELSE 0 END) >= 3 THEN 'High'
         ELSE 'Low'
       END AS ScholarshipStatus
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
GROUP BY faculties.id, faculties.faculty_name;

-- 41. Ուսանողի առաջադիմության կարգավիճակ
-- Հաշվում ենք միջին գնահատականը և դասակարգում ըստ առաջադիմության մակարդակների։
SELECT students.first_name, students.last_name, AVG(grades.grade) AS avg_grade,
  CASE 
    WHEN AVG(grades.grade) >= 18 THEN 'Excellent'
    WHEN AVG(grades.grade) >= 16 THEN 'Good'
    WHEN AVG(grades.grade) >= 14 THEN 'Average'
    ELSE 'Needs Improvement'
  END AS Performance
FROM students
JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name;

-- 42. Դասընթացի հաջողության տոկոս
-- Հաշվում ենք 14 և բարձր ստացած ուսանողների տոկոսային հարաբերությունը ընդհանուրին։
SELECT courses.course_name, 
       (SUM(CASE WHEN grades.grade >= 14 THEN 1 ELSE 0 END) * 100.0) / COUNT(grades.student_id) AS success_percentage
FROM courses
JOIN grades ON courses.id = grades.course_id
GROUP BY courses.id, courses.course_name;

-- 43. Դասախոսների դասընթացների քանակը
-- LEFT JOIN-ի միջոցով հաշվում ենք յուրաքանչյուր դասախոսի դասընթացների քանակը (ներառյալ 0-ները)։
SELECT CONCAT(professors.first_name, ' ', professors.last_name) AS professor_name, COUNT(courses.id) AS course_count
FROM professors
LEFT JOIN courses ON professors.id = courses.professor_id
GROUP BY professors.id, professors.first_name, professors.last_name;

-- 44. Ֆակուլտետ և դասընթացների քանակ
-- Կապում ենք ֆակուլտետը, դասախոսներին և դասընթացները՝ ընդհանուր քանակը հաշվելու համար։
SELECT faculties.faculty_name, COUNT(courses.id) AS course_count
FROM faculties
LEFT JOIN professors ON faculties.id = professors.faculty_id
LEFT JOIN courses ON professors.id = courses.professor_id
GROUP BY faculties.id, faculties.faculty_name;

-- 45. Ուսանողի գնահատականների կարգավիճակ
-- Հաշվում ենք ընդհանուր քննությունների, ինչպես նաև դրական և բացասական գնահատականների քանակը։
SELECT CONCAT(students.first_name, ' ', students.last_name) AS student_name,
       COUNT(grades.grade) AS total_exams,
       SUM(CASE WHEN grades.grade >= 10 THEN 1 ELSE 0 END) AS passed_exams,
       SUM(CASE WHEN grades.grade < 10 THEN 1 ELSE 0 END) AS failed_exams
FROM students
LEFT JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name;

-- 46. Ֆակուլտետների միջին գնահատականները
-- Ցուցադրում ենք ուսանողների միջին գնահատականները ըստ ֆակուլտետների։
SELECT faculties.faculty_name, CONCAT(students.first_name, ' ', students.last_name) AS student_name, AVG(grades.grade) AS avg_grade
FROM students
JOIN grades ON students.id = grades.student_id
JSON_JOIN_ALT: JOIN faculties ON students.faculty_id = faculties.id
GROUP BY faculties.id, faculties.faculty_name, students.id, students.first_name, students.last_name;

-- 47. Ուսանողի ամբողջական պրոֆիլ
-- Համակցում ենք CONCAT, SUBSTRING, IF և CASE ֆունկցիաները ուսանողի մանրամասն պրոֆիլի համար։
SELECT 
  CONCAT(students.first_name, ' ', students.last_name) AS FullName,
  SUBSTRING(students.first_name, 1, 1) AS FirstLetter,
  faculties.faculty_name,
  students.city,
  students.scholarship,
  IF(students.scholarship = 0, 'No Scholarship', 'Scholarship') AS ScholarshipStatus,
  AVG(grades.grade) AS AvgGrade,
  CASE 
    WHEN AVG(grades.grade) >= 18 THEN 'Excellent'
    WHEN AVG(grades.grade) >= 16 THEN 'Good'
    WHEN AVG(grades.grade) >= 14 THEN 'Average'
    ELSE 'Needs Improvement'
  END AS Performance
FROM students
LEFT JOIN faculties ON students.faculty_id = faculties.id
LEFT JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name, faculties.faculty_name, students.city, students.scholarship;

-- 48. Ֆակուլտետի ակադեմիական վարկանիշ
-- Հաշվում ենք ուսանողների քանակը, միջին գնահատականը, միջին կրթաթոշակը և որոշում ֆակուլտետի մակարդակը։
SELECT 
  faculties.faculty_name,
  COUNT(DISTINCT students.id) AS student_count,
  AVG(grades.grade) AS avg_grade,
  AVG(students.scholarship) AS avg_scholarship,
  CASE 
    WHEN AVG(grades.grade) >= 17 THEN 'Excellent Faculty'
    WHEN AVG(grades.grade) >= 15 THEN 'Good Faculty'
    WHEN AVG(grades.grade) >= 13 THEN 'Average Faculty'
    ELSE 'Weak Faculty'
  END AS FacultyLevel
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
LEFT JOIN grades ON students.id = grades.student_id
GROUP BY faculties.id, faculties.faculty_name;

-- 49. Ուսանողի համապարփակ արդյունքը
-- Ցուցադրում ենք ուսանողի քննությունների քանակը, միջինը, առավելագույնը, նվազագույնը և կարգավիճակները։
SELECT 
  CONCAT(students.first_name, ' ', students.last_name) AS FullName,
  faculties.faculty_name,
  COUNT(grades.grade) AS exam_count,
  AVG(grades.grade) AS avg_grade,
  MAX(grades.grade) AS max_grade,
  MIN(grades.grade) AS min_grade,
  IF(students.scholarship > 0, 'Scholarship', 'No Scholarship') AS ScholarshipStatus,
  CASE 
    WHEN AVG(grades.grade) >= 18 THEN 'Excellent'
    WHEN AVG(grades.grade) >= 16 THEN 'Good'
    WHEN AVG(grades.grade) >= 14 THEN 'Average'
    ELSE 'Needs Improvement'
  END AS Performance
FROM students
LEFT JOIN faculties ON students.faculty_id = faculties.id
LEFT JOIN grades ON students.id = grades.student_id
GROUP BY students.id, students.first_name, students.last_name, faculties.faculty_name, students.scholarship;

-- 50. Վերջնական խնդիր — Ֆակուլտետների վերլուծություն
-- Միավորում ենք բոլոր աղյուսակները՝ ֆակուլտետների մասին ամբողջական վիճակագրություն (դեկան, հիմնադրման տարի, քանակներ, գումարներ, կարգավիճակ) ստանալու համար։
SELECT 
  faculties.faculty_name,
  faculties.dean_name,
  faculties.founded_year,
  COUNT(DISTINCT students.id) AS student_count,
  COUNT(DISTINCT professors.id) AS professor_count,
  COUNT(DISTINCT courses.id) AS course_count,
  AVG(grades.grade) AS avg_grade,
  SUM(students.scholarship) AS total_scholarship_fund,
  CASE 
    WHEN AVG(grades.grade) >= 17 THEN 'Excellent'
    WHEN AVG(grades.grade) >= 15 THEN 'Good'
    WHEN AVG(grades.grade) >= 13 THEN 'Average'
    ELSE 'Needs Improvement'
  END AS FacultyStatus
FROM faculties
LEFT JOIN students ON faculties.id = students.faculty_id
LEFT JOIN professors ON faculties.id = professors.faculty_id
LEFT JOIN courses ON professors.id = courses.professor_id
LEFT JOIN grades ON students.id = grades.student_id
GROUP BY faculties.id, faculties.faculty_name, faculties.dean_name, faculties.founded_year;