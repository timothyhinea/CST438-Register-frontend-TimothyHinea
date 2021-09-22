import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import {SERVER_URL} from '../constants.js'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import {DataGrid} from '@material-ui/data-grid';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import AddStudent from './AddStudent';

// NOTE:  for OAuth security, http request must have
//   credentials: 'include' 
//

// properties year, semester required
//  
//  NOTE: because SchedList is invoked via <Route> in App.js  
//  props are accessed via props.location 

class StudentList extends Component {
  constructor(props) {
    super(props);
    this.state = {name:"", email:"test@csumb.edu", student_id: 1, status_code: 1, status: ""};
  } 
  
  componentDidMount() {
    this.fetchStudent();
  }
  
// Fetch student
  fetchStudent = () => {
    console.log("StudentList.fetchStudents");
    const token = Cookies.get('XSRF-TOKEN');
    fetch(`${SERVER_URL}/student?email=${this.state.email}`, 
      {  
        method: 'GET', 
        headers: { 'X-XSRF-TOKEN': token }
      } )
    .then((response) => {
      console.log("FETCH RESP:"+response);
      return response.json();}) 
    .then((responseData) => { 
      // do a sanity check on response
      this.setState({student_id:responseData.student_id});
      this.setState({name:responseData.name});
      this.setState({email:responseData.email});
      this.setState({status_code:responseData.status_code});
      this.setState({status:responseData.status});
    })
    .catch(err => {
      toast.error("Fetch failed.", {
          position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err); 
    })
  }


   // Add Student
   addStudent = (student) => {
    const token = Cookies.get('XSRF-TOKEN');
 
    fetch(`${SERVER_URL}/student`,
      { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json',
                   'X-XSRF-TOKEN': token  }, 
        body: JSON.stringify(student)
      })
    .then(res => {
        if (res.ok) {
          toast.success("Student successfully added", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          this.setState({email:student.email});
          this.fetchStudent();
        } else {
          toast.error("Error when adding", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          console.error('Post http status =' + res.status);
        }})
    .catch(err => {
      toast.error("Error when adding", {
            position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err);
    })
  } 

   // Change Status 
  onChangeStatus = (id) => {
    if (window.confirm('Are you sure you want to change student Status?')) {
      const token = Cookies.get('XSRF-TOKEN');
      var url;
      if(this.state.status_code !=0)
        url = SERVER_URL+ "/student/" + this.state.email + "?status_code=" + 0;
      else 
        url = SERVER_URL+ "/student/" + this.state.email + "?status_code=" + 1;
      
      fetch(url,
        {
          method: 'PUT',
          headers: { 'X-XSRF-TOKEN': token }
        })
    .then(res => {
        if (res.ok) {
          console.log(res);
          toast.success("Status Successfully Changed!", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          this.fetchStudent();
        } else {
          toast.error("Failed to change Status Code", {
              position: toast.POSITION.BOTTOM_LEFT
          });
          console.error('Delete http status =' + res.status);
    }})
      .catch(err => {
        toast.error("Failed To change Staus Code", {
              position: toast.POSITION.BOTTOM_LEFT
        });
        console.error(err);
        console.log(err);
      }) 
    } 
  }

  render() {
     const columns = [
      { field: 'id', headerName: 'ID Number', width: 200 },
      { field: 'name', headerName: 'Name', width: 200 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'status', headerName: 'Status', width: 150 },
      { field: 'status_code', headerName: 'Status Code',  width: 200 },
      {
        field: 'changeStatus',
        headerName: '  ',
        sortable: false,
        width: 200,
        renderCell: (params) => (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              style={{ marginLeft: 16 }} 
              onClick={()=>{this.onChangeStatus(params.value)}}
            >
              Change Status
            </Button>
        )
      }
      ];
      const rows = [{
        name: this.state.name,
        email: this.state.email,
        status: this.state.status,
        status_code: this.state.status_code,
        id:this.state.student_id
      }];
  
  return(
      <div>
          <AppBar position="static" color="default">
            <Toolbar>
               <Typography variant="h6" color="inherit">
                  { 'Students List' }
                </Typography>
            </Toolbar>
          </AppBar>
          <div className="App">
            <Grid container>
              <Grid item>
                  <AddStudent addStudent={this.addStudent}  />
              </Grid>
            </Grid>
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} />
            </div>
            <ToastContainer autoClose={1500} />   
          </div>
      </div>
      ); 
  }
}

// required properties:  year integer , semester string
//  NOTE: because SchedList is invoked via <Route> in App.js  
//  props are accessed via props.location 
StudentList.propTypes = {
  location: (properties, propertyName, componentName) => {
       if ( (!Number.isInteger(properties.location.year)) || !(typeof properties.location.semester === 'string') || (properties.location.semester instanceof String )) {
         return new Error('AddCourse: Missing or invalid property year or semester.');
       }
    }
  }

 
export default StudentList;