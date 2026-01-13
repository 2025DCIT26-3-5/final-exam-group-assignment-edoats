// BSIT Curriculum Course Catalog - Cavite State University 2019-2020

export interface CatalogCourse {
    code: string;
    title: string;
    creditUnits: number;
    prerequisite: string | null;
    yearSemester: string;
}

export const COURSE_CATALOG: CatalogCourse[] = [
    // First Year - First Semester
    { code: "GNED 02", title: "Ethics", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "GNED 05", title: "Purposive Communication", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "GNED 11", title: "Kontekstwalisadong Komunikasyon sa Filipino", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "COSC 50", title: "Discrete Structures I", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "DCIT 21", title: "Introduction to Computing", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "DCIT 22", title: "Computer Programming I", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "FITT 1", title: "Movement Enhancement", creditUnits: 2, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "NSTP 1", title: "National Service Training Program 1", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 1st Sem" },
    { code: "CvSU 101", title: "Institutional Orientation", creditUnits: 1, prerequisite: null, yearSemester: "1st Year - 1st Sem" },

    // First Year - Second Semester
    { code: "GNED 01", title: "Art Appreciation", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 2nd Sem" },
    { code: "GNED 03", title: "Mathematics in the Modern World", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 2nd Sem" },
    { code: "GNED 06", title: "Science, Technology and Society", creditUnits: 3, prerequisite: null, yearSemester: "1st Year - 2nd Sem" },
    { code: "GNED 12", title: "Dalumat Ng/Sa Filipino", creditUnits: 3, prerequisite: "GNED 11", yearSemester: "1st Year - 2nd Sem" },
    { code: "DCIT 23", title: "Computer Programming II", creditUnits: 3, prerequisite: "DCIT 22", yearSemester: "1st Year - 2nd Sem" },
    { code: "ITEC 50", title: "Web Systems and Technologies", creditUnits: 3, prerequisite: "DCIT 21", yearSemester: "1st Year - 2nd Sem" },
    { code: "FITT 2", title: "Fitness Exercises", creditUnits: 2, prerequisite: "FITT 1", yearSemester: "1st Year - 2nd Sem" },
    { code: "NSTP 2", title: "National Service Training Program 2", creditUnits: 3, prerequisite: "NSTP 1", yearSemester: "1st Year - 2nd Sem" },

    // Second Year - First Semester
    { code: "GNED 04", title: "Mga Babasahin Hinggil sa Kasaysayan ng Pilipinas", creditUnits: 3, prerequisite: null, yearSemester: "2nd Year - 1st Sem" },
    { code: "GNED 07", title: "The Contemporary World", creditUnits: 3, prerequisite: null, yearSemester: "2nd Year - 1st Sem" },
    { code: "GNED 10", title: "Gender and Society", creditUnits: 3, prerequisite: null, yearSemester: "2nd Year - 1st Sem" },
    { code: "GNED 14", title: "Panitikang Panlipunan", creditUnits: 3, prerequisite: "GNED 11", yearSemester: "2nd Year - 1st Sem" },
    { code: "ITEC 55", title: "Platform Technologies", creditUnits: 3, prerequisite: "DCIT 23", yearSemester: "2nd Year - 1st Sem" },
    { code: "DCIT 24", title: "Information Management", creditUnits: 3, prerequisite: "DCIT 23", yearSemester: "2nd Year - 1st Sem" },
    { code: "DCIT 50", title: "Object Oriented Programming", creditUnits: 3, prerequisite: "DCIT 23", yearSemester: "2nd Year - 1st Sem" },
    { code: "FITT 3", title: "Physical Activities towards Health and Fitness I", creditUnits: 2, prerequisite: "FITT 1", yearSemester: "2nd Year - 1st Sem" },

    // Second Year - Second Semester
    { code: "GNED 08", title: "Understanding the Self", creditUnits: 3, prerequisite: null, yearSemester: "2nd Year - 2nd Sem" },
    { code: "DCIT 25", title: "Data Structures and Algorithms", creditUnits: 3, prerequisite: "DCIT 50", yearSemester: "2nd Year - 2nd Sem" },
    { code: "ITEC 60", title: "Integrated Programming and Technologies 1", creditUnits: 3, prerequisite: "DCIT 50 & ITEC 55", yearSemester: "2nd Year - 2nd Sem" },
    { code: "ITEC 65", title: "Open Source Technology", creditUnits: 3, prerequisite: "2nd Year Standing", yearSemester: "2nd Year - 2nd Sem" },
    { code: "DCIT 55", title: "Advanced Database System", creditUnits: 3, prerequisite: "DCIT 24", yearSemester: "2nd Year - 2nd Sem" },
    { code: "ITEC 70", title: "Multimedia Systems", creditUnits: 3, prerequisite: "2nd Year Standing", yearSemester: "2nd Year - 2nd Sem" },
    { code: "FITT 4", title: "Physical Activities towards Health and Fitness II", creditUnits: 2, prerequisite: "FITT 1", yearSemester: "2nd Year - 2nd Sem" },

    // Midyear
    { code: "STAT 2", title: "Applied Statistics", creditUnits: 3, prerequisite: "2nd Year Standing", yearSemester: "Midyear" },
    { code: "ITEC 75", title: "System Integration and Architecture 1", creditUnits: 3, prerequisite: "ITEC 60", yearSemester: "Midyear" },

    // Third Year - First Semester
    { code: "ITEC 80", title: "Introduction to Human Computer Interaction", creditUnits: 3, prerequisite: "3rd Year Standing", yearSemester: "3rd Year - 1st Sem" },
    { code: "ITEC 85", title: "Information Assurance and Security 1", creditUnits: 3, prerequisite: "ITEC 75", yearSemester: "3rd Year - 1st Sem" },
    { code: "ITEC 90", title: "Network Fundamentals", creditUnits: 3, prerequisite: "ITEC 55", yearSemester: "3rd Year - 1st Sem" },
    { code: "INSY 55", title: "System Analysis and Design", creditUnits: 3, prerequisite: "3rd Year Standing", yearSemester: "3rd Year - 1st Sem" },
    { code: "DCIT 26", title: "Application Development and Emerging Technologies", creditUnits: 3, prerequisite: "DCIT 55", yearSemester: "3rd Year - 1st Sem" },
    { code: "DCIT 60", title: "Methods of Research", creditUnits: 3, prerequisite: "3rd Year Standing", yearSemester: "3rd Year - 1st Sem" },

    // Third Year - Second Semester
    { code: "GNED 09", title: "Rizal: Life, Works, and Writings", creditUnits: 3, prerequisite: "GNED 4", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 95", title: "Quantitative Methods (Modeling & Simulation)", creditUnits: 3, prerequisite: "COSC 50 & STAT 2", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 101", title: "IT ELECTIVE 1 (Human Computer Interaction 2)", creditUnits: 3, prerequisite: "ITEC 80", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 106", title: "IT ELECTIVE 2 (Web System and Technologies 2)", creditUnits: 3, prerequisite: "ITEC 50", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 100", title: "Information Assurance and Security 2", creditUnits: 3, prerequisite: "ITEC 85", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 105", title: "Network Management", creditUnits: 3, prerequisite: "ITEC 90", yearSemester: "3rd Year - 2nd Sem" },
    { code: "ITEC 200A", title: "Capstone Project and Research 1", creditUnits: 3, prerequisite: "DCIT 60, DCIT 26, ITEC 85", yearSemester: "3rd Year - 2nd Sem" },

    // Fourth Year - First Semester
    { code: "DCIT 65", title: "Social and Professional Issues", creditUnits: 3, prerequisite: "3rd Year Standing", yearSemester: "4th Year - 1st Sem" },
    { code: "ITEC 111", title: "IT ELECTIVE 3 (Integrated Programming and Technologies 2)", creditUnits: 3, prerequisite: "ITEC 60", yearSemester: "4th Year - 1st Sem" },
    { code: "ITEC 116", title: "IT ELECTIVE 4 (Systems Integration and Architecture 2)", creditUnits: 3, prerequisite: "ITEC 75", yearSemester: "4th Year - 1st Sem" },
    { code: "ITEC 110", title: "Systems Administration and Maintenance", creditUnits: 3, prerequisite: "ITEC 100", yearSemester: "4th Year - 1st Sem" },
    { code: "ITEC 200B", title: "Capstone Project and Research 2", creditUnits: 3, prerequisite: "ITEC 200A", yearSemester: "4th Year - 1st Sem" },

    // Fourth Year - Second Semester
    { code: "ITEC 199", title: "Practicum (minimum 486 hours)", creditUnits: 6, prerequisite: "DCIT 26, ITEC 85", yearSemester: "4th Year - 2nd Sem" },
];

// Helper to find course from catalog
export function findCatalogCourse(code: string): CatalogCourse | undefined {
    const normalizedCode = code.trim().toUpperCase();
    return COURSE_CATALOG.find(c => c.code.toUpperCase() === normalizedCode);
}

// Get total credit units for the entire curriculum
export const TOTAL_CURRICULUM_CREDITS = COURSE_CATALOG.reduce((sum, c) => sum + c.creditUnits, 0);
