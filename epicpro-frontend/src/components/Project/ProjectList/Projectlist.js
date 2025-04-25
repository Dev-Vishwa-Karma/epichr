import React, { Component } from 'react'
import { connect } from 'react-redux';
import {
    boxAction, box2Action, box3Action, box4Action, box5Action, box6Action
} from '../../../actions/settingsAction';

class ProjectList extends Component {
    constructor(props) {
        super(props);
        this.handleBox = this.handleBox.bind(this);
        this.state = {
            projectName: "",
            projectDescription: "",
            projectTechnology: "",
            teamMembers: [],
            projectStartDate: "",
            projectEndDate: "",
            successMessage: "",
            errorMessage: "",
            dropdownOpen: false,
            showSuccess: false,
            showError: false,
            employees: [],
            clients: [],
            projects: [],
            allProjects: '',
            selectedClient: "",
            logged_in_employee_id: null,
            logged_in_employee_role: null,
			searchQuery: "",
            errors: {},
            collapsedCards: {},
        }
    }
    handleBoxToggle = (index) => {
        this.setState((prevState) => ({
            collapsedCards: {
                ...prevState.collapsedCards,
                [index]: !prevState.collapsedCards[index], // toggle only the clicked card
            },
        }));
    };
    handleBox(e) {
        this.props.boxAction(e)
    }
    handleBox2(e) {
        this.props.box2Action(e)
    }
    handleBox3(e) {
        this.props.box3Action(e)
    }
    handleBox4(e) {
        this.props.box4Action(e)
    }
    handleBox5(e) {
        this.props.box5Action(e)
    }
    handleBox6(e) {
        this.props.box6Action(e)
    }

    componentDidMount() {
        const {role} = window.user;
        if (window.user?.id) {
            this.setState({
                logged_in_employee_id: window.user.id,
                logged_in_employee_role: role
            });
        }

        // Fetch employees data
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    employees: data.status === 'success' ? data.data : [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });


        // Get projects data
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=view&logged_in_employee_id=${window.user.id}&role=${window.user.role}`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    projects: data.status === 'success' ? data.data : [],
                    allProjects: data.status === 'success' ? data.data: [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });

        // Get clients data
        fetch(`${process.env.REACT_APP_API_URL}/clients.php?action=view`, {
            method: "GET",
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({
                    clients: data.status === 'success' ? data.data : [],
                    loading: false
                });
            } else {
                this.setState({ error: data.message, loading: false });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch employees data' });
            console.error(err);
        });
    }

    // Handle input changes
    handleInputChangeForAddProject = (event) => {
        const { name, value } = event.target;
        this.setState({ 
            [name]: value,
            errors: { ...this.state.errors, [name]: "" }
        });
    };

    handleSelectionChange = (event) => {
        const { name, multiple } = event.target;
        let value = multiple
            ? Array.from(event.target.selectedOptions, (option) => option.value) // Store as an array
            : event.target.value;
    
        this.setState((prevState) => ({
            [name]: value,
            errors: { ...prevState.errors, [name]: "" }
        }));
    };

    toggleDropdown = () => {
        this.setState((prevState) => ({
            dropdownOpen: !prevState.dropdownOpen,
        }));
    };

    handleCheckboxChange = (event) => {
        const { value, checked } = event.target;
    
        this.setState((prevState) => {
            let updatedTeamMembers = [...prevState.teamMembers];
    
            if (checked) {
                // Add employee ID if checked
                updatedTeamMembers.push(value);
            } else {
                // Remove employee ID if unchecked
                updatedTeamMembers = updatedTeamMembers.filter((id) => id !== value);
            }
    
            console.log("Updated Team Members:", updatedTeamMembers); // Debugging
    
            return { teamMembers: updatedTeamMembers };
        });
    };    
    

    // Validate Add Project Form
	validateAddProjectForm = (e) => {
		const { projectName, projectDescription, projectTechnology, teamMembers, projectStartDate, projectEndDate} = this.state;
        let errors = {};
        let isValid = true;

        // Name Validation (Only letters and spaces)
        const namePattern = /^[a-zA-Z\s]+$/;
        if (!projectName.trim()) {
            errors.projectName = "Project Name is required.";
            isValid = false;
        } else if (!namePattern.test(projectName)) {
            errors.projectName = "Project Name must only contain letters and spaces.";
            isValid = false;
        }

        // Description Validation (Required, Min 10 characters)
        if (!projectDescription.trim()) {
            errors.projectDescription = "Project Description is required.";
            isValid = false;
        } else if (projectDescription.length < 10) {
            errors.projectDescription = "Project Description must be at least 10 characters.";
            isValid = false;
        }

        // Technology Validation (Required, allows comma-separated words)
        const technologyPattern = /^[a-zA-Z\s,]+$/;
        if (!projectTechnology.trim()) {
            errors.projectTechnology = "Project Technology is required.";
            isValid = false;
        } else if (!technologyPattern.test(projectTechnology)) {
            errors.projectTechnology = "Projet Technology must only contain letters, commas, and spaces.";
            isValid = false;
        }

        // Client Validation (Required)
        /* if (!selectedClient || selectedClient.trim() === "") {
            errors.selectedClient = "Please select a client.";
            isValid = false;
        } */

        // Team Members Validation (At least one team member should be selected)
        if (!teamMembers || (Array.isArray(teamMembers) && teamMembers.length === 0)) {
            errors.teamMembers = "Please assign at least one team member.";
            isValid = false;
        }

        // Date Validation (Start Date & End Date)
        if (!projectStartDate) {
            errors.projectStartDate = "Project Start Date is required.";
            isValid = false;
        }

        // End Date Validation (Optional, but must be after Start Date if provided)
        if (projectStartDate && projectEndDate && new Date(projectEndDate) < new Date(projectStartDate)) {
            errors.projectEndDate = "Project End Date must be after the Start Date.";
            isValid = false;
        }

        this.setState({ errors });
        return isValid;
	};

    // Add project data API call
    addProjectData = () => {
        const { logged_in_employee_id, projectName, projectDescription, projectTechnology, projectStartDate, projectEndDate, selectedClient, teamMembers } = this.state;

        if (!this.validateAddProjectForm()) {
            return; // Stop execution if validation fails
        }

        const addProjectFormData = new FormData();
        addProjectFormData.append('logged_in_employee_id', logged_in_employee_id);
        addProjectFormData.append('project_name', projectName);
        addProjectFormData.append('project_description', projectDescription);
        addProjectFormData.append('project_technology', projectTechnology);
        addProjectFormData.append('client_id', selectedClient);
        // addProjectFormData.append('team_members', teamMembers);
        addProjectFormData.append('project_start_date', projectStartDate);
        addProjectFormData.append('project_end_date', projectEndDate);

        // Append multiple team members correctly
        teamMembers.forEach((member) => {
            addProjectFormData.append('team_members[]', member);
        });

        // API call to add project
        fetch(`${process.env.REACT_APP_API_URL}/projects.php?action=add`, {
            method: "POST",
            body: addProjectFormData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.success) {
                // Update the project list
                this.setState((prevState) => ({
                    projects: [data.newProject, ...(prevState.projects || [])], // Add project at the start
                    projectName: "",
                    projectDescription: "",
                    projectTechnology: "",
                    selectedClient: "",
                    teamMembers: [],
                    projectStartDate: "",
                    projectEndDate: "",
                    errors:{},
                    successMessage: "Project added successfully!",
                    showSuccess: true,
                }));
                // Close the modal
                document.querySelector("#addProjectModal .close").click();

				// Auto-hide success message after 5 seconds
				setTimeout(() => {
					this.setState({
						showSuccess: false, 
						successMessage: ''
					});
				}, 5000);
            } else {
                this.setState({
                    errorMessage: "Failed to add project. Please try again.",
                    showError: true,
                });

				// Auto-hide success message after 5 seconds
				setTimeout(() => {
					this.setState({
						showError: false,
						errorMessage: ''
					});
				}, 5000);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            this.setState({
                errorMessage: "An error occurred while adding the project.",
                showError: true,
            });
        });
    };

    // Reset form errors when modal is closed
    resetFormErrors = () => {
        this.setState({
            errors: {}, // Clear all error messages
            projectName: "",
            projectDescription: "",
            projectTechnology: "",
            selectedClient: "",
            teamMembers: "",
            projectStartDate: "",
            projectEndDate: "",
        });
    };

    // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    // Add searching functionalit for project search
	handleSearch = (event) => {
        const query = event.target.value.toLowerCase(); // Get search input
        this.setState({ searchQuery: query }, () => {
			if (query === "") {
				// If search is empty, reset projects to the original list
				this.setState({ projects: this.state.allProjects });
			} else {
				const filtered = this.state.allProjects.filter(project => {
					return (
						project.project_name.toLowerCase().includes(query) ||
						project.project_technology.toLowerCase().includes(query)
					);
				});
				this.setState({ projects: filtered });
			}
        });
    };

    // Render function for Bootstrap toast messages
    renderAlertMessages = () => {
        return (
            
            <>
                {/* Add the alert for success messages */}
                <div 
                    className={`alert alert-success alert-dismissible fade show ${this.state.showSuccess ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-circle-check me-2"></i>
                    {this.state.successMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showSuccess: false })}
                    >
                    </button>
                </div>

                {/* Add the alert for error messages */}
                <div 
                    className={`alert alert-danger alert-dismissible fade show ${this.state.showError ? "d-block" : "d-none"}`} 
                    role="alert" 
                    style={{ 
                        position: "fixed", 
                        top: "20px", 
                        right: "20px", 
                        zIndex: 1050, 
                        minWidth: "250px", 
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" 
                    }}
                >
                    <i className="fa-solid fa-triangle-exclamation me-2"></i>
                    {this.state.errorMessage}
                    <button
                        type="button"
                        className="close"
                        aria-label="Close"
                        onClick={() => this.setState({ showError: false })}
                    >
                    </button>
                </div>
            </>
        );
    };

    render() {
        const { fixNavbar/* , boxOpen */ } = this.props;
        const { projectName, projectDescription, projectTechnology, projectStartDate, projectEndDate, clients, selectedClient, teamMembers, employees, projects, message, logged_in_employee_role} = this.state;

        return (
            <>
                {this.renderAlertMessages()} {/* Show Toast Messages */}
                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="d-flex justify-content-between align-items-center">
                            <ul className="nav nav-tabs page-header-tab">
                                <li className="nav-item"><a className="nav-link active" id="Project-tab" data-toggle="tab" href="#Project-OnGoing">OnGoing</a></li>
                                {/* <li className="nav-item"><a className="nav-link" id="Project-tab" data-toggle="tab" href="#Project-UpComing">UpComing</a></li> */}
                            </ul>
                            <div className="header-action d-md-flex">
                                <div className="input-group mr-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Search project..."
                                        name="s"
                                        value={this.state.searchQuery}
                                        onChange={this.handleSearch}
                                    />
                                </div>
                                {(logged_in_employee_role === 'admin' || logged_in_employee_role === 'super_admin') && (
                                    <button type="button" className="btn btn-primary" data-toggle="modal" data-target="#addProjectModal"><i className="fe fe-plus mr-2" />Add</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body mt-3">
                    <div className="container-fluid">
                        <div className="tab-content">
                            <div className="tab-pane fade show active" id="Project-OnGoing" role="tabpanel">
                                <div className="row">
                                {projects && projects.length > 0 ? (
                                    projects.map((project, index) => (
                                            <div className="col-lg-4 col-md-12" key={index}>
                                                <div className={`card ${this.state.collapsedCards[index] ? 'card-collapsed' : ""}`}>
                                                    <div className="card-header">
                                                        <h3 className="card-title">{project.project_name}</h3>
                                                        <div className="card-options">
                                                            <label className="custom-switch m-0">
                                                                <input type="checkbox" defaultValue={1} className="custom-switch-input" defaultChecked />
                                                                <span className="custom-switch-indicator" />
                                                            </label>
                                                            <span className="card-options-collapse" data-toggle="card-collapse" onClick={() => this.handleBoxToggle(index)}
                                                            ><i className="fe fe-chevron-up" /></span>
                                                        </div>
                                                    </div>
                                                    <div className="card-body">
                                                        <span className="tag tag-blue mb-3">{project.project_technology}</span>
                                                        <p>{project.project_description}</p>
                                                        <div className="row">
                                                            <div className="col-4 py-1"><strong>Created:</strong></div>
                                                            <div className="col-8 py-1">
                                                                {new Date(project.created_at).toLocaleString("en-US", {
                                                                    day: "2-digit",
                                                                    month: "short",
                                                                    year: "numeric",
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: true,
                                                                }).replace(",", "")}
                                                            </div>
                                                            {/* <div className="col-4 py-1"><strong>Creator:</strong></div>
                                                            <div className="col-8 py-1">Nathan Guerrero</div> */}
                                                            <div className="col-4 py-1"><strong>Team:</strong></div>
                                                            <div className="col-8 py-1">
                                                                <div className="avatar-list avatar-list-stacked">
                                                                    {project.team_members.map((member) => (
                                                                        <span
																			className="avatar avatar-blue add-space"
																			data-toggle="tooltip"
																			data-placement="top"
                                                                            title={`${member.first_name} ${member.last_name}`}
																		>
																			{member.first_name.charAt(0).toUpperCase()}{member.last_name.charAt(0).toUpperCase()}
																		</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {/* <div className="card-footer">
                                                        <div className="clearfix">
                                                            <div className="float-left"><strong>15%</strong></div>
                                                            <div className="float-right"><small className="text-muted">Progress</small></div>
                                                        </div>
                                                        <div className="progress progress-xs">
                                                            <div className="progress-bar bg-red" role="progressbar" style={{ width: '15%' }} aria-valuenow={36} aria-valuemin={0} aria-valuemax={100} />
                                                        </div>
                                                    </div> */}
                                                </div>
                                            </div>
                                        ))
                                ): (
                                    !message && <tr><td>projects not available.</td></tr>
                                )}
                                </div>
                            </div>
                            <div className="tab-pane fade" id="Project-UpComing" role="tabpanel">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="table-responsive">
                                            <table className="table table-hover table-striped table-vcenter mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Owner</th>
                                                        <th>Milestone</th>
                                                        <th className="w100">Work</th>
                                                        <th className="w100">Duration</th>
                                                        <th>Priority</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar1.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Isidore Dilao</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span className="text-warning">Medium</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar2.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Maricel Villalon</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>68:00</span></td>
                                                        <td>105:0 hrs</td>
                                                        <td><span className="text-danger">High</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar3.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Theresa Wright</span></td>
                                                        <td>Approval site</td>
                                                        <td><span>74:00</span></td>
                                                        <td>89:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar4.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Jason Porter</span></td>
                                                        <td>Final touch up</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar5.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Annelyn Mercado</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar6.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Sean Black</span></td>
                                                        <td>Basement slab preparation</td>
                                                        <td><span>88:00</span></td>
                                                        <td>88:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar7.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>Scott Ortega</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>56:00</span></td>
                                                        <td>125:0 hrs</td>
                                                        <td><span className="text-warning">Medium</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td><img src="../assets/images/xs/avatar8.jpg" alt="Avatar" className="w30 rounded-circle mr-2" /> <span>David Wallace</span></td>
                                                        <td>Account receivable</td>
                                                        <td><span>30:00</span></td>
                                                        <td>30:0 hrs</td>
                                                        <td><span>None</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Add Project Modal */}
                <div className="modal fade" id="addProjectModal" tabIndex={-1} role="dialog" aria-labelledby="addProjectModalLabel" data-backdrop="static" 
                data-keyboard="false">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="addProjectModalLabel">Add Project</h5>
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.resetFormErrors}><span aria-hidden="true">×</span></button>
                            </div>
                            <div className="modal-body">
                                <div className="row clearfix">
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectName">Project Name</label>
                                            <input
                                                type="text"
                                                // className="form-control"
                                                className={`form-control ${this.state.errors.projectName ? "is-invalid" : ""}`}
                                                placeholder="Project Name"
                                                name="projectName"
                                                value={projectName}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectName && (
                                                <small className="invalid-feedback">{this.state.errors.projectName}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectDescription">Project Description</label>
                                            <textarea
                                                className={`form-control ${this.state.errors.projectDescription ? "is-invalid" : ""}`}
                                                placeholder="Project Description"
                                                name="projectDescription"
                                                value={projectDescription}
                                                onChange={this.handleInputChangeForAddProject}
                                                rows={3}
                                            >
                                            </textarea>
                                            {this.state.errors.projectDescription && (
                                                <small className="invalid-feedback">{this.state.errors.projectDescription}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectTechnology">Project Technology</label>
                                            <input
                                                type="text"
                                                className={`form-control ${this.state.errors.projectTechnology ? "is-invalid" : ""}`}
                                                placeholder="Enter technologies (comma-separated)"
                                                name="projectTechnology"
                                                value={projectTechnology}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectTechnology && (
                                                <small className="invalid-feedback">{this.state.errors.projectTechnology}</small>
                                            )}
                                        </div>
                                    </div>
                                    {/* Client Details */}
                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="selectedClient">Select Client</label>
                                            <select
                                                name='selectedClient'
                                                id="selectedClient"
                                                className={`form-control ${this.state.errors.selectedClient ? "is-invalid" : ""}`}
                                                value={selectedClient}
                                                onChange={this.handleSelectionChange}
                                            >
                                                {clients.length > 0 ? (
                                                    <>
                                                        <option value="">Select a Client</option>
                                                        {clients.map((client) => (
                                                            <option key={client.id} value={client.id}>
                                                                {client.name}
                                                            </option>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <option value="">No clients available</option>
                                                )}
                                            </select>
                                            {this.state.errors.selectedClient && (
                                                <small className="invalid-feedback">{this.state.errors.selectedClient}</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-12">
                                        <div className="form-group">
                                            <label className="form-label">Assign Team Members</label>
                                            {/* Custom dropdown */}
                                            <div className="dropdown w-100">
                                                <button
                                                    type="button"
                                                    className="form-control dropdown-toggle"
                                                    onClick={this.toggleDropdown}
                                                    style={{ textAlign: "left" }}
                                                >
                                                    {teamMembers.length > 0
                                                        ? `${teamMembers.length} selected`
                                                        : "Select Team Members"}
                                                </button>

                                                {this.state.dropdownOpen && (
                                                    <div className="dropdown-menu show w-100 p-2" style={{ maxHeight:"120px", overflowY: "auto" }}>
                                                        {employees.map((employee) => (
                                                            <div key={employee.id} className="form-check">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    id={`emp_${employee.id}`}
                                                                    value={String(employee.id)}
                                                                    checked={teamMembers.includes(String(employee.id))}
                                                                    onChange={this.handleCheckboxChange}
                                                                />
                                                                <label className="form-check-label" htmlFor={`emp_${employee.id}`}>
                                                                    {employee.first_name} {employee.last_name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {this.state.errors.teamMembers && (
                                                <small className="invalid-feedback">{this.state.errors.teamMembers}</small>
                                            )}
                                        </div>
                                    </div>

                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectStartDate">Project start date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${this.state.errors.projectStartDate ? "is-invalid" : ""}`}
                                                name="projectStartDate"
                                                value={projectStartDate}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectStartDate && (
                                                <small className="invalid-feedback">{this.state.errors.projectStartDate}</small>
                                            )}
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="projectEndDate">Project end date</label>
                                            <input
                                                type="date"
                                                className={`form-control ${this.state.errors.projectEndDate ? "is-invalid" : ""}`}
                                                name="projectEndDate"
                                                value={projectEndDate}
                                                onChange={this.handleInputChangeForAddProject}
                                            />
                                            {this.state.errors.projectEndDate && (
                                                <small className="invalid-feedback">{this.state.errors.projectEndDate}</small>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.resetFormErrors}>Close</button>
                                <button type="button" onClick={this.addProjectData} className="btn btn-primary">Add project</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}
const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar,
    boxOpen: state.settings.isbox,
    box2Open: state.settings.isbox2,
    box3Open: state.settings.isbox3,
    box4Open: state.settings.isbox4,
    box5Open: state.settings.isbox5,
    box6Open: state.settings.isbox6,
})

const mapDispatchToProps = dispatch => ({
    boxAction: (e) => dispatch(boxAction(e)),
    box2Action: (e) => dispatch(box2Action(e)),
    box3Action: (e) => dispatch(box3Action(e)),
    box4Action: (e) => dispatch(box4Action(e)),
    box5Action: (e) => dispatch(box5Action(e)),
    box6Action: (e) => dispatch(box6Action(e))
})
export default connect(mapStateToProps, mapDispatchToProps)(ProjectList);