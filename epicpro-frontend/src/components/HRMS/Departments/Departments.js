import React, { Component } from 'react'
import { connect } from 'react-redux';

class departments extends Component {
    constructor(props) {
		super(props);
		this.state = {
            departmentName: "",
            departmentHead: "",
            departmentData: [], // To store the list of users
            selectedDepartment: null,
            departmentToDelete: null,
		    message: null, // To store error messages
		};
	}

    componentDidMount() {
        // fetch('http://localhost/react/epicpro-backend/departments.php?action=view')
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=view`)
		.then(response => response.json())
		.then(data => {
			if (data.status === 'success') {
			    this.setState({ departmentData: data.data }); // Update users in state
			} else {
			    this.setState({ message: data.message }); // Update error in state
			}
		})
		.catch(err => {
			this.setState({ message: 'Failed to fetch data' });
			console.error(err);
		});
    }

    // Handle edit button click
    handleEditClick = (department) => {
        this.setState({ selectedDepartment: department });
    };

    // Handle input change for editing fields
    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState((prevState) => ({
            selectedDepartment: {
                ...prevState.selectedDepartment,
                [name]: value, // Dynamically update the field
            },
        }));
    };

    // Save the changes (API call)
    saveChanges = () => {
        const { selectedDepartment } = this.state;
        if (!selectedDepartment) return;

        // Example API call
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=edit&id=${selectedDepartment.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                department_name: selectedDepartment.department_name,
                department_head: selectedDepartment.department_head,
            }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to update department');
            }
            return response.json();
        })
        .then((data) => {
            if (data.success) {
                this.setState((prevState) => {
                    // Update the existing department in the array
                    const updatedDepartmentData = prevState.departmentData.map((dept) =>
                        dept.id === selectedDepartment.id ? { ...dept, ...data.updatedDepartmentData } : dept
                    );
                
                    return {
                        departmentData: updatedDepartmentData,
                    };
                });
                

                document.querySelector("#editDepartmentModal .close").click();
                // Optionally reload the department data here
            } else {
                console.log('Failed to update department!');
            }
        })
        .catch((error) => console.error('Error updating department:', error));
    };

    openModal = (departmentId) => {
        this.setState({
            departmentToDelete: departmentId, // Save the department data
        });
    };
      
    confirmDelete = () => {
        const { departmentToDelete } = this.state;
      
        if (!departmentToDelete) return;
      
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=delete&id=${departmentToDelete}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => response.json())
        .then((data) => {
        if (data.success) {
            this.setState((prevState) => ({
                departmentData: prevState.departmentData.filter((d) => d.id !== departmentToDelete),
            }));
            document.querySelector("#deleteDepartmentModal .close").click();
        } else {
            alert('Failed to delete department.');
        }
        })
        .catch((error) => console.error('Error:', error));
    };

    // Handle input changes
    handleInputChangeForAddDepartment = (event) => {
        const { name, value } = event.target;
        this.setState({ [name]: value });
    };

    // Add department data API call
    addDepartmentData = () => {
        const { departmentName, departmentHead} = this.state;

        // Validate form inputs
        if (!departmentName || !departmentHead) {
            alert("Please fill in all fields");
            return;
        }

        const addDepartmentFormData = new FormData();
        addDepartmentFormData.append('department_name', departmentName);
        addDepartmentFormData.append('department_head', departmentHead);

        // API call to add department
        fetch(`${process.env.REACT_APP_API_URL}/departments.php?action=add`, {
            method: "POST",
            body: addDepartmentFormData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Update the department list
                this.setState((prevState) => ({
                    departmentData: [...(prevState.departmentData || []), data.newDepartment], // Assuming the backend returns the new department
                    departmentName: "",
                    departmentHead: "",
                    numOfEmployees: "",
                }));
                // Close the modal
                document.querySelector("#addDepartmentModal .close").click();
            } else {
                alert("Failed to add department");
            }
        })
        .catch((error) => console.error("Error:", error));
    };

    render() {
        const { fixNavbar } = this.props;
        const { departmentName, departmentHead, departmentData, selectedDepartment, message } = this.state;
        return (
            <>
                <div>
                    <div>
                        <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                            <div className="container-fluid">
                                <div className="d-flex justify-content-between align-items-center">
                                    <ul className="nav nav-tabs page-header-tab">
                                        <li className="nav-item"><a className="nav-link active" id="Departments-tab" data-toggle="tab" href="#Departments-list">List View</a></li>
                                        <li className="nav-item"><a className="nav-link" id="Departments-tab" data-toggle="tab" href="#Departments-grid">Grid View</a></li>
                                    </ul>
                                    <div className="header-action">
                                        <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addDepartmentModal"><i className="fe fe-plus mr-2" />Add</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="section-body mt-3">
                            <div className="container-fluid">
                                <div className="tab-content mt-3">
                                    <div className="tab-pane fade show active" id="Departments-list" role="tabpanel">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Departments List</h3>
                                                <div className="card-options">
                                                    <form>
                                                        <div className="input-group">
                                                            <input type="text" className="form-control form-control-sm" placeholder="Search something..." name="s" />
                                                            <span className="input-group-btn ml-2"><button className="btn btn-icon" type="submit"><span className="fe fe-search" /></button></span>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="table-responsive">
                                                    <table className="table table-striped table-vcenter table-hover mb-0">
                                                        <thead>
                                                            <tr>
                                                                <th>#</th>
                                                                <th>Department Name</th>
                                                                <th>Department Head</th>
                                                                <th>Total Employee</th>
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {departmentData.length > 0 ? (
                                                                departmentData.map((department, index) => (
                                                                    <tr key={index}>
                                                                        <td>{index + 1}</td>
                                                                        <td>
                                                                            <div className="font-15">{department.department_name}</div>
                                                                        </td>
                                                                        <td>{department.department_head}</td>
                                                                        <td>102</td>
                                                                        <td>
                                                                            <button 
                                                                                type="button"
                                                                                className="btn btn-icon"
                                                                                title="Edit"
                                                                                data-toggle="modal"
                                                                                data-target="#editDepartmentModal"
                                                                                onClick={() => this.handleEditClick(department)}
                                                                            >
                                                                                <i className="fa fa-edit" />
                                                                            </button>
                                                                            <button 
                                                                                type="button"
                                                                                className="btn btn-icon btn-sm js-sweetalert"
                                                                                title="Delete"
                                                                                data-type="confirm"
                                                                                onClick={() => this.openModal(department.id)}
                                                                                data-toggle="modal"
                                                                                data-target="#deleteDepartmentModal"
                                                                            >
                                                                                <i className="fa fa-trash-o text-danger" />
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                ))
                                                            ): (
                                                                !message && <tr><td>Department not found</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="tab-pane fade" id="Departments-grid" role="tabpanel">
                                        <div className="row clearfix">
                                            {departmentData.length > 0 ? (
                                                departmentData.map((department, index) => (
                                                    <div className="col-lg-3 col-md-6" key={index}>
                                                        <div className="card">
                                                            <div className="card-body text-center">
                                                                <img className="img-thumbnail rounded-circle avatar-xxl" src="../assets/images/sm/avatar2.jpg" alt="fake_url" />
                                                                <h6 className="mt-3">{department.department_head}</h6>
                                                                <div className="text-center text-muted mb-3">{department.department_name}</div>
                                                                <button type="button" className="btn btn-icon btn-outline-primary"><i className="fa fa-pencil" /></button>
                                                                <button type="button" className="btn btn-icon btn-outline-danger"><i className="fa fa-trash" /></button>
                                                            </div>
                                                            <div className="card-footer text-center">
                                                                <div className="row clearfix">
                                                                    <div className="col-6">
                                                                        <h5 className="mb-0">105</h5>
                                                                        <div className="text-muted">Employee</div>
                                                                    </div>
                                                                    <div className="col-6">
                                                                        <h5 className="mb-0">$3100</h5>
                                                                        <div className="text-muted">Earnings</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ): (
                                                <div>
                                                    <span colSpan="2">Department not found</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* Add Department Modal */}
                    <div className="modal fade" id="addDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="addDepartmentModalLabel" /* aria-hidden="true" */>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="addDepartmentModalLabel">Add Departments</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Departments Name"
                                                    name="departmentName"
                                                    value={departmentName}
                                                    onChange={this.handleInputChangeForAddDepartment}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-12">
                                            <div className="form-group">
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    placeholder="Departments Head"
                                                    name="departmentHead"
                                                    value={departmentHead}
                                                    onChange={this.handleInputChangeForAddDepartment}
                                                />
                                            </div>
                                        </div>
                                        {/* <div className="col-md-12">
                                            <div className="form-group">
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="No of Employee"
                                                    name="numOfEmployees"
                                                    value={numOfEmployees}
                                                    onChange={this.handleInputChangeForAddDepartment}
                                                />
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" onClick={this.addDepartmentData} className="btn btn-primary">Save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Edit Department Modal */}
                    <div className="modal fade" id="editDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="editDepartmentModalLabel" /* aria-hidden="true" */>
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="editDepartmentModalLabel">Edit Departments</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    {selectedDepartment ? (
                                        <>
                                            <div className="row clearfix">
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Departments Name</label>
                                                        <input 
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedDepartment.department_name} onChange={this.handleInputChange}
                                                            name="department_name"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Departments Head</label>
                                                        <input
                                                            type="text"
                                                            className="form-control"
                                                            value={selectedDepartment.department_head} onChange={this.handleInputChange}
                                                            name="department_head"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Total Employee</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value="102"
                                                            onChange={this.handleInputChange}
                                                            name="total_employee"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <p>Loading department data...</p>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" className="btn btn-primary" onClick={this.saveChanges}>Save changes</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delete Department Model */}
                    <div 
                        className="modal fade" id="deleteDepartmentModal" tabIndex={-1} role="dialog" aria-labelledby="deleteDepartmentModalLabel"
                    >
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header" style={{ display: 'none' }}>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">×</span></button>
                                </div>
                                <div className="modal-body">
                                    <div className="row clearfix">
                                        <p>Are you sure you want to delete the department?</p>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal" >Cancel</button>
                                    <button type="button" onClick={this.confirmDelete} className="btn btn-danger">Delete</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(departments);