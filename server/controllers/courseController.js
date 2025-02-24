import Course from "../models/Course.js";

//get all courses
// Get all courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({ isPublished: true })
            .populate({ path: 'educator' }) // ✅ Populate first
            .select('-courseContent -enrolledStudents'); // ✅ Select fields

        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};


//get course by id
export const getCourseId = async (req, res) => {
    const { id } = req.params;

    try {
        const courseData = await Course.findById(id).populate({ path: "educator" });

        if (!courseData) {
            return res.json({ success: false, message: "Course not found" });
        }

        // Ensure courseContent exists and is an array
        if (Array.isArray(courseData.courseContent)) {
            courseData.courseContent.forEach((chapter) => {
                // Ensure chapterContent exists and is an array
                if (Array.isArray(chapter.chapterContent)) {
                    chapter.chapterContent.forEach((lecture) => {
                        if (!lecture.isPreviewFree) {
                            lecture.lectureUrl = "";
                        }
                    });
                } else {
                    chapter.chapterContent = []; // Set to empty array if undefined
                }
            });
        } else {
            courseData.courseContent = []; // Set to empty array if undefined
        }

        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};