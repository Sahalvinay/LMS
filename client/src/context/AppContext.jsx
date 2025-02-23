import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyCourses } from '../assets/assets'
import humanizeDuration from 'humanize-duration'

export const AppContext = createContext() 
export const AppContextProvider = (props)=>{

    const currency = import.meta.env.VITE_CURRENCY   
    const navigate = useNavigate()
    const [allCourses,setAllCourses] = useState([])
    const [isEducator,setIsEducator] = useState(true)
    const [enrolledCourses,setenrolledCourses] = useState([])

    //fetch courses
    const FetchAllCourses = async ()=>{
      setAllCourses(dummyCourses)
    }
    //function to calculate avg rating
    const calculateRating  = (course)=>{
      if(course.courseRatings.length === 0){
        return 0;
      }
      let totalRating = 0
      course.courseRatings.forEach(rating => {
        totalRating += rating.rating
      })
      return totalRating / course.courseRatings.length 
    }
    // calculate course chp time
    const calculateChapterTime = (chapter)=>{
      let time = 0
      chapter.chapterContent.map((lecture)=>time += lecture.lectureDuration)
      return humanizeDuration(time * 60 * 1000, {units : ["h","m"]})
    }

    // course duration
    const calculateCourseDuration = (course)=>{
      let time = 0

      course.courseContent.map((chapter)=> chapter.chapterContent.map((lecture)=>
        time += lecture.lectureDuration
      ))

      return humanizeDuration(time * 60 * 1000, {units : ["h","m"]})
    }
    // no of lecture

    const calculateNoOfLectures = (course)=>{
      let totalLectures = 0;
      course.courseContent.forEach(chapter =>{
        if(Array.isArray(chapter.chapterContent)){
          totalLectures += chapter.chapterContent.length
        }
      });
      return totalLectures;
    }

    // fetch user enrolled courses:
    const fetchUserEnrolledCourses = async ()=>{
      setenrolledCourses(dummyCourses)
    }

    useEffect(()=>{
      FetchAllCourses();
      fetchUserEnrolledCourses();
    },[])

    const value = {
      currency,allCourses,navigate,calculateRating,isEducator,setIsEducator,calculateChapterTime,calculateNoOfLectures,calculateCourseDuration,enrolledCourses,fetchUserEnrolledCourses
    }
    return(
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
    )
}
export default AppContext