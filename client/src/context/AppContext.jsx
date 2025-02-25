import { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import humanizeDuration from 'humanize-duration'
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from 'axios'
import { toast } from 'react-toastify';

export const AppContext = createContext() 
export const AppContextProvider = (props)=>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const currency = import.meta.env.VITE_CURRENCY   
    const navigate = useNavigate()

    const {getToken} = useAuth()
    const {user} = useUser()

    const [allCourses,setAllCourses] = useState([])
    const [isEducator,setIsEducator] = useState(false)
    const [enrolledCourses,setenrolledCourses] = useState([])
    const [userData,setUserData] = useState(null)

    //fetch courses
    const FetchAllCourses = async ()=>{
      try {
        const {data} = await axios.get(backendUrl + '/api/course/all');

        if(data.success){
          setAllCourses(data.courses)
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(error.message)
      }
    }

    // fetch userdata
    const fetchUserData = async ()=>{

      if(user.publicMetadata.role === 'educator'){
        setIsEducator(true)
      }
      try {
        const token = await getToken();

        const {data} = await axios.get(backendUrl + '/api/user/data', {headers: {Authorization: `Bearer ${token}`}})
        if(data.success){
          setUserData(data.user)
        }else{
          toast.error(data.message)
        }
      } catch (error) {
        toast.error(data.message)
      }
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
      return Math.floor(totalRating / course.courseRatings.length) 
    }
    // calculate course chp time
    const calculateChapterTime = (chapter)=>{
      let time = 0
      chapter.chapterContent.map((lecture)=>time += lecture.lectureDuration)
      return humanizeDuration(time * 60 * 1000, {units : ["h","m"]})
    }

    // course duration
    const calculateCourseDuration = (course) => {
      if (!course || !Array.isArray(course.courseContent)) {
          console.error("Invalid course data:", course);
          return "N/A"; // Handle gracefully
      }
  
      let time = 0;
      course.courseContent.forEach((chapter) => {
          if (chapter && Array.isArray(chapter.chapterContent)) {
              chapter.chapterContent.forEach((lecture) => {
                  time += lecture.lectureDuration || 0; // Avoid undefined values
              });
          }
      });
  
      return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  };
  
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

      try {
        const token = await getToken();
        const { data } = await axios.get(backendUrl + '/api/user/enrolled-courses', {headers: {Authorization: `Bearer ${token}`}})

        if(data.success){
          setenrolledCourses(data.enrolledCourses.reverse())
        }else{
          toast.error(data.message)
        }
      } catch (error) {
          toast.error(error.message)
      }
      
    }

    useEffect(()=>{
      FetchAllCourses()
    },[])

    useEffect(()=>{
      if(user){
        fetchUserData()
        fetchUserEnrolledCourses()
      }
    },[user])

    const value = {
      currency,allCourses,navigate,calculateRating,isEducator,setIsEducator,calculateChapterTime,calculateNoOfLectures,calculateCourseDuration,enrolledCourses,fetchUserEnrolledCourses,backendUrl,userData,setUserData,getToken,FetchAllCourses
    }
    return(
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
    )
}
export default AppContext