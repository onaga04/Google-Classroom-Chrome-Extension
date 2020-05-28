/**
 * Lists 10 course names and ids.
 * (student)CAOA Official Class (44425413301)
 * (instructor)Demo Class (43115435171)
 * (Owner) Dev Class (51807892865)
 * Evan ID: 114384411164040557741
   51807892865
 */
function listCourses() {
  var optionalArgs = {
    pageSize: 10,
    teacherId: 'me'
  };
  var response = Classroom.Courses.list(optionalArgs);
  var courses = response.courses;
  Logger.log(courses);
  if (courses && courses.length > 0) {
    for (i = 0; i < courses.length; i++) {
      var course = courses[i];
      Logger.log('%s, %s (%s)', course.name, course.section, course.id);
      return [course.name,course.id]
    }
  } else {
    Logger.log('No courses found.');
    return []
  }
}


/*
studentSubmissions checks all of the submissions associated with courseId. If that submission has a passing grade, the student id associated with that submission is added to the sidsp(student id pass) array.
If the submissionn grade is not passing or not present, the student id associated with that submission is added to the sidsf(student id fail) array. Both of these arrays are returned.
*/
function studentSubmissions(courseId,courseWorkId) {
  var submissions = Classroom.Courses.CourseWork.StudentSubmissions.list(courseId, courseWorkId);
  var sidsp = [];
  var sidsf = [];
  for(var i = 0; i<submissions.studentSubmissions.length; i++){
    var grade = submissions.studentSubmissions[i]['assignedGrade'];
    if(grade >= 70){
//      Logger.log(submissions.studentSubmissions[i]['userId']);
      sidsp.push(submissions.studentSubmissions[i]['userId']);
    } else if(grade < 70) {
//      Logger.log('Student is not ready to move on');
//      Logger.log(submissions.studentSubmissions[i]['userId']);
      sidsf.push(submissions.studentSubmissions[i]['userId']);
    }
  }
//  Logger.log(sidsp);
//  Logger.log(sidsf);
  return [sidsp,sidsf];
}

/*
assignNext receives a coursework object and an array of student ids. It will then do 0 or more of the following: publish the coursework, change individual students that are assigned to the 
coursework, or assign all students to the coursework
*/
function assignNext(courseWork, sids) {
  Logger.log(courseWork);
  if(courseWork['state'] == 'DRAFT'){
    courseWork['state'] = 'PUBLISHED';
    var coursework = Classroom.Courses.CourseWork.patch(courseWork,courseWork['courseId'], courseWork['id'], {updateMask:'state'});
    Logger.log(courseWork);
  }
  if(sids[0].length > 0 && sids[1].length > 0){
    var body = {
      "assigneeMode": 'INDIVIDUAL_STUDENTS',
      "modifyIndividualStudentsOptions":{
        "addStudentIds": [sids[0]],
        "removeStudentIds": [sids[1]]
      }
    } 
    var ret = Classroom.Courses.CourseWork.modifyAssignees(body, courseWork['courseId'], courseWork['id'])
  }else if(sids[0].length > 0 && sids[1].length == 0){
    var body = {
      "assigneeMode": 'ALL_STUDENTS'
    }
    var ret = Classroom.Courses.CourseWork.modifyAssignees(body, courseWork['courseId'], courseWork['id'])
  }else{
    Logger.log("Error: No students found in addstudents array");
  }
    
}
function chooseCourse(courseID=-1){
  if(courseID == -1){
    courses = Classroom.Courses.list().courses
    if (courses && courses.length > 0) {
      for(let i = 0; i < courses.length; i++){
        checkAll(courses[i].id)
      }
    }
  }else{
    checkAll(courseID)
  }
}
/*
checkAll gets all of the coursework objects associated with a classroom id and iterates backwards through the published ones. It first calls studentSubmissions to get all of the student id associated with
passing or failing grades. Then it will call assignNext and send the next coursework object along with the student ids. The loop ends before the last assignment. It does the last assignment separatly because
the next assignment will be a draft. It will make sure their are student ids in the passing array before calling assignNext on the last draft assignment.
*/
function checkAll(){
  var optionalArgs = {
    pageSize: 10,
    courseWorkStates: 'DRAFT'
  };
  courses = Classroom.Courses.list().courses
  if (courses && courses.length > 0) {
    for(let i = 0; i < courses.length; i++){
      courseID = courses[i].id
      var allstudents = Classroom.Courses.Students.list(courseID);
      var assignments = Classroom.Courses.CourseWork.list(courseID);
      var dassignments = Classroom.Courses.CourseWork.list(courseID,optionalArgs);
      for(var j = assignments.courseWork.length - 1; j > 0 ; j--){
        var sids = studentSubmissions(courseID,assignments.courseWork[j]['id']);
        var check = sids[0].concat(sids[1]);
        Logger.log(assignments.courseWork[j]['title']);
        Logger.log(sids);
        for(var k = 0; k < allstudents.students.length; k++){
          if(check.indexOf(allstudents.students[k]['userId']) == -1){
            sids[1].push(allstudents.students[k]['userId']);
          }
        }
        Logger.log(sids);
        assignNext(assignments.courseWork[j-1], sids);      
      }
      var sids = studentSubmissions(courseID, assignments.courseWork[0]['id']);
      var check = sids[0].concat(sids[1]);
      Logger.log(sids);
      for(var k = 0; k < allstudents.students.length; k++){
        if(check.indexOf(allstudents.students[k]['userId']) == -1){
          sids[1].push(allstudents.students[k]['userId']);
        }
      }
      Logger.log(sids);
      if(sids[0].length > 0){
        Logger.log("Hi");
        assignNext(dassignments.courseWork[dassignments.courseWork.length - 1], sids);
      }
    }
  }
}


/*
createAssignments makes four new coursework objects. One is published and open to all students, the others are drafts and only visible to the teacher. This function is necessary because
google scripts can only edit the coursework objects it creates.
*/

function createAssignments() {
 var assignments = Classroom.Courses.CourseWork.list(51807892865);
  Logger.log(assignments);
  if(assignments == '{}'){
    var matLes1 = 
        { "link": {"url": 'https://drive.google.com/open?id=19HMZplZuFDGagwkICaQbC9y68e6aMf0R'}}
    var matLes2 = 
        { "link": {"url": 'https://drive.google.com/open?id=1jCRznFU1s5ZABG2sEeudkC9lgCTeVkAM'}}
    var matLes3 = 
        { "link": {"url": 'https://drive.google.com/open?id=1zZuF1CmV0tbJPkg2AmwDq32vKNZmtCWK'}}
    var matLes4 = 
        { "link": {"url": 'https://drive.google.com/open?id=1TjyQZ4N-g6H68b94c6QSsdevy-vGw42gKW5o00_HwI8'}}
    var matLes5 = 
        { "link": {"url": 'https://drive.google.com/open?id=1h1G2bwfg-oxKvyDvBcC3Ei5HLelv4IVd'}}
    var matLes6 = 
        { "link": {"url": 'https://drive.google.com/open?id=13922n5kRykVBgnwCpiQVq3pgZTtFWemY'}}
    var matLes7 = 
        { "link": {"url": 'https://drive.google.com/open?id=1IVkvbRxMTk1OmzgDNmar2_KCXN4BEVcU'}}
    var matLes8 = 
        { "link": {"url": 'https://drive.google.com/open?id=1vCPgUghkSWe6MTqdR_B9Dz8hvGBFSRbZ'}}
    var matLes9 = 
        { "link": {"url": 'https://drive.google.com/open?id=11xmgoq82l0dj2Of02LiDXHK2g-tZ9mFF'}}
    var matLes10 = 
        { "link": {"url": ''}}
    var matLes11 = 
        { "link": {"url": ''}}
    var matLes12 = 
        { "link": {"url": ''}}
    var matLes13 = 
        { "link": {"url": ''}}
    var matLes14 = 
        { "link": {"url": ''}}
    var matLes15 = 
        { "link": {"url": ''}}
    var matLes16 = 
        { "link": {"url": ''}}
    var matLes17 = 
        { "link": {"url": ''}}
    var matLes18 = 
        { "link": {"url": ''}}
    var course_work = Classroom.Courses.CourseWork.create({"title": "Coins","state": "PUBLISHED","description": "Place that holds coin values", "workType": "ASSIGNMENT","maxPoints": 1800}, 51807892865);
    if(course_work){
      course_work = Classroom.Courses.CourseWork.create({"title": "Lesson 1","state": "DRAFT","description": "Please answer all of the questions in a google doc and submit it as an attachment when you are finished!","materials": matLes1, "workType": "ASSIGNMENT","maxPoints": 100}, 51807892865);
    }else return false;
    if(course_work){
      course_work = Classroom.Courses.CourseWork.create({"title": "Lesson 2","state": "DRAFT","description": "Please answer all of the questions in a google doc and submit it as an attachment when you are finished!","materials": matLes2, "workType": "ASSIGNMENT","maxPoints": 100}, 51807892865);
    }else return false;
    if(course_work){
      course_work = Classroom.Courses.CourseWork.create({"title": "Lesson 3","state": "DRAFT","description": "Please answer all of the questions in a google doc and submit it as an attachment when you are finished!","materials": matLes3, "workType": "ASSIGNMENT","maxPoints": 100}, 51807892865);
    }else return Logger.log(course_work);
    if(course_work){
      course_work = Classroom.Courses.CourseWork.create({"title": "Lesson 4","state": "DRAFT","description": "Please answer all of the questions in a google doc and submit it as an attachment when you are finished!","materials": matLes4, "workType": "ASSIGNMENT","maxPoints": 100}, 51807892865);
    }else return false;

  }
  if(course_work) return true;
  else return false;  
}
