import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

class ViewEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            employee: {
                first_name: "",
                last_name: "",
                username: "",
                email: "",
                mobile_no1: "",
                dob: "",
                address_line1: "",
                about_me: ""
            },
            employeeId: null,
            selectedImage: null,
            previewImage: null,
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
            activeTab: "",
            activities: [],
        };
    }

    // Function to dismiss messages
    dismissMessages = () => {
        this.setState({
            showSuccess: false,
            successMessage: "",
            showError: false,
            errorMessage: "",
        });
    };

    componentDidMount() {
        const { employee, employeeId, tab } = this.props.location.state || {};

        // Get the logged-in user from localStorage
        const storedUser = JSON.parse(localStorage.getItem("user")) || null;

        // Set the state with the employee data
        if (employee) {
            this.setState({
                employee: { ...this.state.employee, ...employee },
                employeeId,
                previewImage: `${process.env.REACT_APP_API_URL}/${employee.profile}`,
                activeTab: tab,
            });
        }

        // If viewing the logged-in user's profile, use the latest localStorage data
        if (storedUser && employee && storedUser.id === employee.id) {
            this.setState({
                employee: { ...this.state.employee, ...storedUser }, // Merge the latest stored data
                employeeId: storedUser.id,
                previewImage: `${process.env.REACT_APP_API_URL}/${storedUser.profile}`
            });
        }

        if (employeeId) {
            this.fetchEmployeeDetails(employeeId);
        }

        // Get activities
        let apiUrl = '';

		if (window.user.role === 'super_admin' || window.user.role === 'admin') {
		apiUrl = `${process.env.REACT_APP_API_URL}/activities.php`;
		}
		else {
		apiUrl = `${process.env.REACT_APP_API_URL}/activities.php?user_id=${window.user.id}`;
		}

		fetch(apiUrl, {
			method: "GET",
		})
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                this.setState({ activities: data.data });
            } else {
                this.setState({ errorMessage: data.message });
            }
        })
        .catch(err => {
            this.setState({ error: 'Failed to fetch data' });
            console.error(err);
        });
    }

    componentDidUpdate(prevProps) {
        const { employee, employeeId, tab } = this.props.location.state || {};
        if (employee && employee !== prevProps.location.state?.employee) {
            this.setState({
                employee: { ...this.state.employee, ...employee },
                previewImage: `${process.env.REACT_APP_API_URL}/${employee?.profile || ""}`
            });
        }
    
        if (employeeId && employeeId !== prevProps.location.state?.employeeId) {
            this.fetchEmployeeDetails(employeeId);
        }

         // Watch for tab change even if pathname is same
        if (tab && tab !== prevProps.location.state?.tab) {
            this.setState({ activeTab: tab });
        }
    }

    fetchEmployeeDetails = (employeeId) => {
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=view&user_id=${employeeId}`, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status === "success") {
                    this.setState(prevState => ({
                        employee: { ...prevState.employee, ...data.data }, // Merge new data
                        previewImage: data.data.profile ? `${process.env.REACT_APP_API_URL}/${data.data.profile}` : prevState.previewImage
                    }));
                } else {
                    console.error("Failed to fetch employee details:", data.message);
                }
            })
            .catch((error) => console.error("Error fetching employee details:", error));
    };

    handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            this.setState({
                selectedImage: file,
                previewImage: URL.createObjectURL(file),
            });
    
            // Call function to upload image
            this.uploadImage(file);
        }
    };

    uploadImage = (file) => {
        const {id, role} = window.user;
        const { employeeId } = this.state;
        const formData = new FormData();
        formData.append("employee_id", employeeId);
        formData.append("logged_in_employee_id", id);
        formData.append('logged_in_employee_role', role); // Logged-in employee role
        formData.append("photo", file);
    
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employeeId}`, {
          method: "POST",
          body: formData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Correct the image path and set the previewImage state
                const profileImagePath = data.data.profile.replace(/\\/g, '/');

                // Update the previewImage state correctly
                this.setState((prevState) => ({
                    previewImage: `${process.env.REACT_APP_API_URL}/${profileImagePath}`,
                    employee: { 
                        ...prevState.employee, 
                        profile: profileImagePath // Update the profile in employee data
                    },
                    successMessage: "Image uploaded successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false
                }));
                setTimeout(this.dismissMessages, 3000);
            } else {
                this.setState({
                    errorMessage: "Image upload failed!",
                    showError: true,
                    showSuccess: false,
                });
                // setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch((error) => {
            console.error("Error uploading image:", error);
            this.setState({
                errorMessage: "An error occurred while uploading the image.",
                showError: true,
                showSuccess: false,
            });
            // setTimeout(this.dismissMessages, 3000);
        });
    };

    // Update profile
    handleProfileChange = (event) => {
        const { name, value } = event.target;
        
        // Update state for the selected user
        this.setState((prevState) => ({
            employee: {
                ...prevState.employee,
                [name]: value,
            }
        }));
    };

    updateProfile = () => {
        const { employee } = this.state;

        // Get the logged-in user from localStorage
        const storedUser = window.user || JSON.parse(localStorage.getItem("user"));
        if (!storedUser || !storedUser.id) {
            console.warn("User data missing from localStorage");
            return;
        }

        const { id, role } = storedUser;
        // Create a new FormData object
        const updatedProfileData = new FormData();

        // Helper function to ensure blank values are stored as empty strings
        const appendField = (key, value) => {
            updatedProfileData.append(key, value !== undefined && value !== null ? value : "");
        };

        appendField("id", employee.id);
        appendField("logged_in_employee_id", id);
        appendField("logged_in_employee_role", role);
        appendField("first_name", employee.first_name);
        appendField("last_name", employee.last_name);
        appendField("username", employee.username);
        appendField("email", employee.email);
        appendField("mobile_no1", employee.mobile_no1);
        appendField("dob", employee.dob);
        appendField("address_line1", employee.address_line1);
        appendField("about_me", employee.about_me);

        // Preserve social media URLs even if not updated
        appendField("facebook_url", employee.facebook_url);
        appendField("twitter_url", employee.twitter_url);
    
        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=edit&user_id=${employee.id}`, {
            method: "POST",
            body: updatedProfileData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                const updatedUser = data.data;

                // Only update the logged-in user's data
                if (employee.id === id) {
                    const mergedUserData = { ...storedUser, ...updatedUser };

                    // Store updated data in local storage
                    localStorage.setItem("user", JSON.stringify(mergedUserData));
                    window.user = mergedUserData;

                    // Update state to re-render UI with new data
                    this.setState({ employee: mergedUserData });
                } else {
                    // If updating another user from the listing, just update the state
                    this.setState({ employee: updatedUser });
                }

                this.setState((prevState) => ({
                    successMessage: "Profile updated successfully!",
                    showSuccess: true,
                    errorMessage: "",
                    showError: false
                }));
    
                // Auto-hide success message after 5 seconds
                setTimeout(this.dismissMessages, 5000);
            } else {
                this.setState({
                    errorMessage: "Failed to update profile.",
                    showError: true,
                    showSuccess: false
                });
    
                // setTimeout(this.dismissMessages, 3000);
            }
        })
        .catch(error => {
            console.error("Error updating profile:", error);
            this.setState({
                errorMessage: "An error occurred while updating the profile.",
                showError: true,
                showSuccess: false,
            });

            // setTimeout(this.dismissMessages, 3000);
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
        const { fixNavbar} = this.props;
        const {employee, activities, errorMessage} = this.state;
        // Handle case where employee data is not available
        if (!employee) {
            return <p>Loading employee details...</p>;
        }
        return (
            <>
                {this.renderAlertMessages()} {/* Show Toast Messages */}

                <div className={`section-body ${fixNavbar ? "marginTop" : ""} `}>
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-md-12">
                                <div className="card card-profile">
                                    <div className="card-body text-center">
                                        {/* <img className="card-profile-img" src={`${process.env.REACT_APP_API_URL}/${employee.profile}`} alt="fake_url" /> */}

                                        <div style={{ position: "relative", display: "inline-block" }}>
                                            {/* Profile Image */}
                                            <img
                                                className="card-profile-img"
                                                src={this.state.previewImage}
                                                alt="Profile"
                                                style={{
                                                    borderRadius: "50%",
                                                    objectFit: "cover",
                                                }}
                                            />

                                            {/* Camera Icon Overlay */}
                                            <label
                                                htmlFor="imageUpload"
                                                className='card-profile-img'
                                                style={{
                                                    position: "absolute",
                                                    bottom: "0px",
                                                    right: "0px",
                                                    background: "#ececec",
                                                    color: "#000000",
                                                    borderRadius: "50%",
                                                    padding: "5px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faCamera} />
                                                <input
                                                    id="imageUpload"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={this.handleImageChange}
                                                    style={{ display: "none" }}
                                                />
                                            </label>
                                        </div>

                                        <h4 className="mb-3">{`${employee.first_name} ${employee.last_name || ''}`}</h4>
                                        <ul className="social-links list-inline mb-3 mt-2">
                                            {/* Facebook Link */}
                                            {employee.facebook_url && employee.facebook_url !== "null" && employee.facebook_url.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={employee.facebook_url} title="Facebook" data-toggle="tooltip" target="_blank" rel="noopener noreferrer">
                                                        <i className="fa fa-facebook" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()} 
                                                        title="Facebook (No link available)" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-facebook" />
                                                    </a>
                                                </li>
                                            )}

                                            {/* Twitter Link */}
                                            {employee.twitter_url && employee.twitter_url !== "null" && employee.twitter_url.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={employee.twitter_url} title="Twitter" data-toggle="tooltip" target="_blank" rel="noopener noreferrer">
                                                        <i className="fa fa-twitter" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Twitter (No link available)" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-twitter" />
                                                    </a>
                                                </li>
                                            )}

                                            {/* Phone Link */}
                                            {employee.mobile_no1 && employee.mobile_no1 !== "null" && employee.mobile_no1.trim() !== "" ? (
                                                <li className="list-inline-item">
                                                    <a href={`tel:${employee.mobile_no1}`} title={employee.mobile_no1} data-toggle="tooltip">
                                                        <i className="fa fa-phone" />
                                                    </a>
                                                </li>
                                            ) : (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href="#"
                                                        onClick={(e) => e.preventDefault()}
                                                        title="Mobile Number not available" 
                                                        data-toggle="tooltip"
                                                        style={{ cursor: "default" }}
                                                    >
                                                        <i className="fa fa-phone" />
                                                    </a>
                                                </li>
                                            )}

                                            {/* Skype Link with Full Name */}
                                            {employee.first_name && employee.last_name && (
                                                <li className="list-inline-item">
                                                    <a 
                                                        href={`skype:${employee.first_name.toLowerCase()}.${employee.last_name.toLowerCase()}?chat`}
                                                        title={`${employee.first_name} ${employee.last_name}`} 
                                                        data-toggle="tooltip"
                                                    >
                                                        <i className="fa fa-skype" />
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                        <p className="mb-4" style={{ whiteSpace: "pre-line" }}>{employee.about_me}</p>
                                        {/* <button className="btn btn-outline-primary btn-sm"><span className="fa fa-twitter" /> Follow</button> */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section-body  py-4">
                    <div className="container-fluid">
                        <div className="row clearfix">
                            <div className="col-12">
                                <ul className="nav nav-tabs mb-3" id="pills-tab" role="tablist">
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "calendar" ? "active" : ""}`}
                                            id="pills-calendar-tab"
                                            data-toggle="pill"
                                            href="#pills-calendar"
                                            role="tab"
                                            aria-controls="pills-calendar"
                                            aria-selected={this.state.activeTab === "calendar"}
                                            onClick={() => this.setState({ activeTab: "calendar" })}
                                        >
                                            Calendar
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "timeline" ? "active" : ""}`}
                                            id="pills-timeline-tab"
                                            data-toggle="pill"
                                            href="#pills-timeline"
                                            role="tab"
                                            aria-controls="pills-timeline"
                                            aria-selected={this.state.activeTab === "timeline"}
                                            onClick={() => this.setState({ activeTab: "timeline" })}
                                        >
                                            Timeline
                                        </a>
                                    </li>
                                    <li className="nav-item">
                                        <a
                                            className={`nav-link ${this.state.activeTab === "profile" ? "active" : ""}`}
                                            id="pills-profile-tab"
                                            data-toggle="pill"
                                            href="#pills-profile"
                                            role="tab"
                                            aria-controls="pills-profile"
                                            aria-selected={this.state.activeTab === "profile"}
                                            onClick={() => this.setState({ activeTab: "profile" })}
                                        >
                                            Profile
                                        </a>
                                    </li>
                                    {/* <li className="nav-item">
                                        <a className="nav-link" id="pills-blog-tab" data-toggle="pill" href="#pills-blog" role="tab" aria-controls="pills-blog" aria-selected="true">Blog</a>
                                    </li> */}
                                </ul>
                            </div>
                            <div className="col-lg-12 col-md-12">
                                <div className="tab-content" id="pills-tabContent">
                                    <div className={`tab-pane fade ${this.state.activeTab === "calendar" ? "show active" : ""}`} id="pills-calendar" role="tabpanel" aria-labelledby="pills-calendar-tab">
                                        <div className="card">
                                            <div className="card-header bline">
                                                <h3 className="card-title">Calendar</h3>
                                                <div className="card-options">
                                                    <a href="/#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize" /></a>
                                                    <div className="item-action dropdown ml-2">
                                                        <a href="fake_url" data-toggle="dropdown"><i className="fe fe-more-vertical" /></a>
                                                        <div className="dropdown-menu dropdown-menu-right">
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-eye" /> View Details </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt" /> Share </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download" /> Download</a>
                                                            <div className="dropdown-divider" />
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-copy" /> Copy to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-folder" /> Move to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-edit" /> Rename</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-trash" /> Delete</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div id="calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "timeline" ? "show active" : ""}`} id="pills-timeline" role="tabpanel" aria-labelledby="pills-timeline-tab">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Activity</h3>
                                                <div className="card-options">
                                                    <a href="/#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up" /></a>
                                                    <a href="/#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize" /></a>
                                                    <a href="/#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x" /></a>
                                                    <div className="item-action dropdown ml-2">
                                                        <a href="fake_url" data-toggle="dropdown"><i className="fe fe-more-vertical" /></a>
                                                        <div className="dropdown-menu dropdown-menu-right">
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-eye" /> View Details </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt" /> Share </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download" /> Download</a>
                                                            <div className="dropdown-divider" />
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-copy" /> Copy to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-folder" /> Move to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-edit" /> Rename</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-trash" /> Delete</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                {activities.length > 0 ? (
                                                    activities.map((activity, index) => (
                                                        <>
                                                            {/* In Time Entry */}
                                                            {activity.activity_type === 'Break' && (
                                                                <div className="timeline_item ">
                                                                    <img
                                                                        className="tl_avatar"
                                                                        src="../assets/images/xs/avatar1.jpg"
                                                                        alt="fake_url"
                                                                    />
                                                                    <span>
                                                                        <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                        <small className="float-right text-right">
                                                                            {activity.in_time}
                                                                        </small>
                                                                    </span>
                                                                    <h6 className="font600">
                                                                        (Break In) {activity.description}
                                                                    </h6>

                                                                    <div className="msg">
                                                                        {activity.created_by && (
                                                                            <a class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Out Time Entry */}
                                                            {activity.activity_type === 'Break' && activity.out_time && (
                                                                <>
                                                                    <div className="duration text-center">
                                                                        ------ {activity.duration} ------
                                                                    </div>
                                                                    <div className="timeline_item ">
                                                                        <img
                                                                            className="tl_avatar"
                                                                            src="../assets/images/xs/avatar1.jpg"
                                                                            alt="fake_url"
                                                                        />
                                                                        <span>
                                                                            <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                            <small className="float-right text-right">
                                                                                {activity.out_time}
                                                                            </small>
                                                                        </span>
                                                                        <h6 className="font600">
                                                                            Break out
                                                                        </h6>
                                                                        <div className="msg">
                                                                            {activity.updated_by && (
                                                                                <a class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}

                                                            {/* In Time Entry Punch */}
                                                            {activity.activity_type === 'Punch' && (
                                                                <div className="timeline_item ">
                                                                    <img
                                                                        className="tl_avatar"
                                                                        src="../assets/images/xs/avatar1.jpg"
                                                                        alt="fake_url"
                                                                    />
                                                                    <span>
                                                                        <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                        <small className="float-right text-right">
                                                                            {activity.in_time}
                                                                        </small>
                                                                    </span>
                                                                    <h6 className="font600">
                                                                        has started his day
                                                                    </h6>

                                                                    <div className="msg">
                                                                        {activity.created_by && (
                                                                            <a class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Created by System Admin</a>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {/* Out Time Entry */}
                                                            {activity.activity_type === 'Punch' && activity.out_time && (
                                                                <>
                                                                    <div className="duration text-center">
                                                                        ------ {activity.duration} ------
                                                                    </div>
                                                                    <div className="timeline_item ">
                                                                        <img
                                                                            className="tl_avatar"
                                                                            src="../assets/images/xs/avatar1.jpg"
                                                                            alt="fake_url"
                                                                        />
                                                                        <span>
                                                                            <a href="#">{activity.first_name} {activity.last_name}</a> {/* {activity.location} */}
                                                                            <small className="float-right text-right">
                                                                                {activity.out_time}
                                                                            </small>
                                                                        </span>
                                                                        <h6 className="font600">
                                                                            has ended his day
                                                                        </h6>
                                                                        <div className="msg">
                                                                            {activity.updated_by && (
                                                                                <a class="mr-20 text-muted"><i class="fa fa-user text-pink"></i> Edited by System Admin</a>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </>
                                                    ))
                                                ) : (
                                                    errorMessage && <p>{errorMessage}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`tab-pane fade ${this.state.activeTab === "profile" ? "show active" : ""}`} id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">
                                        <div className="card">
                                            <div className="card-header">
                                                <h3 className="card-title">Edit Profile</h3>
                                                <div className="card-options">
                                                    <a href="/#" className="card-options-fullscreen" data-toggle="card-fullscreen"><i className="fe fe-maximize" /></a>
                                                    <a href="/#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x" /></a>
                                                    <div className="item-action dropdown ml-2">
                                                        <a href="fake_url" data-toggle="dropdown"><i className="fe fe-more-vertical" /></a>
                                                        <div className="dropdown-menu dropdown-menu-right">
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-eye" /> View Details </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-share-alt" /> Share </a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-cloud-download" /> Download</a>
                                                            <div className="dropdown-divider" />
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-copy" /> Copy to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-folder" /> Move to</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-edit" /> Rename</a>
                                                            <a href="fake_url" className="dropdown-item"><i className="dropdown-icon fa fa-trash" /> Delete</a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-body">
                                                <div className="row clearfix">
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">First Name</label>
                                                            <input
                                                                type="text"
                                                                name='first_name'
                                                                className="form-control" placeholder="First Name"
                                                                value={employee.first_name || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Last Name</label>
                                                            <input
                                                                type="text"
                                                                name='last_name'
                                                                className="form-control"
                                                                placeholder="Last Name"
                                                                value={employee.last_name || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Username</label>
                                                            <input
                                                                type="text"
                                                                name='username'
                                                                className="form-control"
                                                                placeholder="Username"
                                                                value={employee.username || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Email address</label>
                                                            <input
                                                                type="email"
                                                                name='email'
                                                                className="form-control"
                                                                placeholder="Email"
                                                                value={employee.email || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Mobile No</label>
                                                            <input
                                                                type="tel"
                                                                name="mobile_no1"
                                                                id="mobile_no1"
                                                                className="form-control"
                                                                placeholder="Enter Mobile No"
                                                                value={employee.mobile_no1 || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">DOB</label>
                                                            <input
                                                                type="date"
                                                                id="dob"
                                                                name="dob"
                                                                className="form-control"
                                                                value={employee.dob || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group">
                                                            <label className="form-label">Address</label>
                                                            <input
                                                                type="text"
                                                                name='address_line1'
                                                                className="form-control"
                                                                placeholder="Home Address"
                                                                value={employee.address_line1 || ""}
                                                                onChange={this.handleProfileChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-12">
                                                        <div className="form-group mb-0">
                                                            <label className="form-label">About Me</label>
                                                            <textarea rows={5} name='about_me' className="form-control" placeholder="Here can be your description" value={employee.about_me || ""} onChange={this.handleProfileChange}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="card-footer text-right">
                                                <button type="submit" className="btn btn-primary" onClick={this.updateProfile}>Update Profile</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* <div className="tab-pane fade" id="pills-blog" role="tabpanel" aria-labelledby="pills-blog-tab">
                                        <div className="card">
                                            <div className="card-body">
                                                <div className="new_post">
                                                    <div className="form-group">
                                                        <textarea rows={4} className="form-control no-resize" placeholder="Please type what you want..." defaultValue={""} />
                                                    </div>
                                                    <div className="mt-4 text-right">
                                                        <button className="btn btn-warning"><i className="icon-link" /></button>
                                                        <button className="btn btn-warning"><i className="icon-camera" /></button>
                                                        <button className="btn btn-primary">Post</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card blog_single_post">
                                            <div className="img-post">
                                                <img className="d-block img-fluid" src="../assets/images/gallery/6.jpg" alt="First slide" />
                                            </div>
                                            <div className="card-body">
                                                <h4><a href="/#">All photographs are accurate</a></h4>
                                                <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                            </div>
                                            <div className="footer">
                                                <div className="actions">
                                                    <a href="fake_url;" className="btn btn-outline-secondary">Continue Reading</a>
                                                </div>
                                                <ul className="stats list-unstyled">
                                                    <li><a href="fake_url;">General</a></li>
                                                    <li><a href="fake_url;" className="icon-heart"> 28</a></li>
                                                    <li><a href="fake_url;" className="icon-bubbles"> 128</a></li>
                                                </ul>
                                            </div>
                                            <ul className="list-group card-list-group">
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">4 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Aenean lacinia bibendum nulla sed consectetur. Vestibulum id ligula porta felis euismod semper. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Cras
                                                                justo odio, dapibus ac facilisis in, egestas eget quam. Vestibulum id ligula porta felis euismod semper. Cum sociis natoque penatibus et magnis dis parturient montes,
                                                                nascetur ridiculus mus.
                                                        </div>
                                                            <ul className="media-list">
                                                                <li className="media mt-4">
                                                                    <img className="media-object avatar mr-4" src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                                    <div className="media-body">
                                                                        <strong>Debra Beck: </strong>
                                                                        Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec ullamcorper nulla non metus
                                                                        auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis.
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card blog_single_post">
                                            <div className="img-post">
                                                <img className="d-block img-fluid" src="../assets/images/gallery/4.jpg" alt="First slide" />
                                            </div>
                                            <div className="card-body">
                                                <h4><a href="/#">All photographs are accurate</a></h4>
                                                <p>It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal</p>
                                            </div>
                                            <div className="footer">
                                                <div className="actions">
                                                    <a href="fake_url;" className="btn btn-outline-secondary">Continue Reading</a>
                                                </div>
                                                <ul className="stats list-unstyled">
                                                    <li><a href="fake_url;">General</a></li>
                                                    <li><a href="fake_url;" className="icon-heart"> 28</a></li>
                                                    <li><a href="fake_url;" className="icon-bubbles"> 128</a></li>
                                                </ul>
                                            </div>
                                            <ul className="list-group card-list-group">
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar7.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">12 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Donec id elit non mi porta gravida at eget metus. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis
                                                                parturient montes, nascetur ridiculus mus. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                                <li className="list-group-item py-5">
                                                    <div className="media">
                                                        <img className="media-object avatar avatar-md mr-4" src="../assets/images/xs/avatar6.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <div className="media-heading">
                                                                <small className="float-right text-muted">34 min</small>
                                                                <h5>Peter Richards</h5>
                                                            </div>
                                                            <div>
                                                                Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Aenean eu leo quam. Pellentesque ornare sem lacinia quam
                                                                venenatis vestibulum. Etiam porta sem malesuada magna mollis euismod. Donec sed odio dui.
                                                            </div>
                                                            <ul className="media-list">
                                                                <li className="media mt-4">
                                                                    <img className="media-object avatar mr-4" src="../assets/images/xs/avatar5.jpg" alt="fake_url" />
                                                                    <div className="media-body">
                                                                        <strong>Wayne Holland: </strong>
                                                                        Donec id elit non mi porta gravida at eget metus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Donec ullamcorper nulla non metus
                                                                        auctor fringilla. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Sed posuere consectetur est at lobortis.
                                                                    </div>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div> */}
                                </div>
                            </div>
                            {/* <div className="col-lg-4 col-md-12">
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-trophy text-success font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Total Earned</h6>
                                                <span className="mb-0">$96K +</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-heart text-warning font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Total Likes</h6>
                                                <span className="mb-0">6,270</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-handbag text-danger font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Delivered</h6>
                                                <span className="mb-0">720 Delivered</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="widgets1">
                                            <div className="icon">
                                                <i className="icon-user text-primary font-30" />
                                            </div>
                                            <div className="details">
                                                <h6 className="mb-0 font600">Jobs</h6>
                                                <span className="mb-0">614</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card">
                                    <div className="card-header">
                                        <h3 className="card-title">Followers</h3>
                                        <div className="card-options">
                                            <a href="/#" className="card-options-collapse" data-toggle="card-collapse"><i className="fe fe-chevron-up" /></a>
                                            <a href="/#" className="card-options-remove" data-toggle="card-remove"><i className="fe fe-x" /></a>
                                        </div>
                                    </div>
                                    <div className="card-body">
                                        <ul className="right_chat list-unstyled mb-0">
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar4.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Donald Gardner</span>
                                                            <span className="message">Designer, Blogger</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="offline">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Nancy Flanary</span>
                                                            <span className="message">Art director, Movie Cut</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Phillip Smith</span>
                                                            <span className="message">Writter, Mag Editor</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar4.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Donald Gardner</span>
                                                            <span className="message">Designer, Blogger</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="offline">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar1.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Nancy Flanary</span>
                                                            <span className="message">Art director, Movie Cut</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                            <li className="online">
                                                <a href="fake_url;">
                                                    <div className="media">
                                                        <img className="media-object " src="../assets/images/xs/avatar3.jpg" alt="fake_url" />
                                                        <div className="media-body">
                                                            <span className="name">Phillip Smith</span>
                                                            <span className="message">Writter, Mag Editor</span>
                                                            <span className="badge badge-outline status" />
                                                        </div>
                                                    </div>
                                                </a>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div> */}
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
export default connect(mapStateToProps, mapDispatchToProps)(ViewEmployee);