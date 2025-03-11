import React, { Component } from 'react';
import { connect } from 'react-redux';

class AddEmployee extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDepartment: "",
            departments: [],
            firstName: "",
            lastName: "",
            username: "",
            email: "",
            gender: "",
            photo: null,
            dob: "",
            joiningDate: "",
            mobile1: "",
            mobile2: "",
            password: "",
            address1: "",
            address2: "",
            emergencyContact1: "",
            emergencyContact2: "",
            emergencyContact3: "",
            skillsFrontend: [],
            skillsBackend: [],
            bankAccountName: "",
            bankAccountNo: "",
            bankName: "",
            ifscCode: "",
            bankAddress: "",
            salaryDetails: [
                { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" },
            ],
            aadharCardNumber: "",
            aadharCardFile: null,
            drivingLicenseNumber: "",
            drivingLicenseFile: null,
            panCardNumber: "",
            panCardFile: null,
            facebook: "",
            twitter: "",
            linkedin: "",
            instagram: "",
            upworkProfile: "",
            resume: null,
            successMessage: "",
            showSuccess: false,
            errorMessage: "",
            showError: false,
        };

        // Create refs for each file input
        this.fileInputRefs = {
            photo: React.createRef(),
            aadharCardFile: React.createRef(),
            drivingLicenseFile: React.createRef(),
            panCardFile: React.createRef(),
            resume: React.createRef()
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
        // Get department data from departments table
		fetch(`${process.env.REACT_APP_API_URL}/departments.php`)
        .then(response => response.json())
        .then(data => {
			this.setState({ departments: data.data });
        })
        .catch(error => console.error("Error fetching departments:", error));
    }

    handleChange = (e) => {
        const { name, value } = e.target;
        this.setState({
          [name]: value,
        });
    };

    handleSalaryDetails = (index, field, value) => {
        this.setState((prevState) => {
            const updatedEntries = [...prevState.salaryDetails];
            updatedEntries[index][field] = value;
            return { salaryDetails: updatedEntries };
        });
    };

    // Add more salary details
    addMore = () => {
        this.setState((prevState) => ({
            salaryDetails: [...prevState.salaryDetails, { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" }],
        }));
    };

    // Remove an entry
    removeEntry = (index) => {
        const salaryDetails = this.state.salaryDetails.filter((_, i) => i !== index);
        this.setState({ salaryDetails });
    };

    handleFileChange = (e) => {
        const { name, files } = e.target;
        this.setState({
          [name]: files[0],
        });
    };
    
    handleSkillChange = (e, category) => {
        const { value, checked } = e.target;
        this.setState((prevState) => {
          const updatedSkills = checked
            ? [...prevState[category], value]
            : prevState[category].filter((skill) => skill !== value);
    
          return { [category]: updatedSkills };
        });
    };

    addEmployee = async (e) => {
		e.preventDefault();
        const {id, role} = window.user;

        const { 
            selectedDepartment,
            firstName,
            lastName,
            username,
            email,
            gender,
            photo,
            dob,
            joiningDate,
            mobile1,
            mobile2,
            password,
            address1,
            address2,
            emergencyContact1,
            emergencyContact2,
            emergencyContact3,
            skillsFrontend,
            skillsBackend,
            bankAccountName,
            bankAccountNo,
            bankName,
            ifscCode,
            bankAddress,
            salaryDetails,
            aadharCardNumber,
            aadharCardFile,
            drivingLicenseNumber,
            drivingLicenseFile,
            panCardNumber,
            panCardFile,
            facebook,
            twitter,
            linkedin,
            instagram,
            upworkProfile,
            resume } = this.state;

		const addEmployeeData = new FormData();
        addEmployeeData.append('department_id', selectedDepartment)
        addEmployeeData.append('first_name', firstName);
        addEmployeeData.append('last_name', lastName);
        addEmployeeData.append('username', username);
        addEmployeeData.append('email', email);
        addEmployeeData.append('gender', gender);
        addEmployeeData.append('photo', photo);
        addEmployeeData.append('dob', dob);
        addEmployeeData.append('joining_date', joiningDate);
        addEmployeeData.append('mobile_no1', mobile1);
        addEmployeeData.append('mobile_no2', mobile2);
        addEmployeeData.append('password', password);
        addEmployeeData.append('address_line1', address1);
        addEmployeeData.append('address_line2', address2);
        addEmployeeData.append('emergency_contact1', emergencyContact1);
        addEmployeeData.append('emergency_contact2', emergencyContact2);
        addEmployeeData.append('emergency_contact3', emergencyContact3);
        addEmployeeData.append('frontend_skills', skillsFrontend);
        addEmployeeData.append('backend_skills', skillsBackend);
        addEmployeeData.append('account_holder_name', bankAccountName);
        addEmployeeData.append('account_number', bankAccountNo);
        addEmployeeData.append('bank_name', bankName);
        addEmployeeData.append('ifsc_code', ifscCode);
        addEmployeeData.append('bank_address', bankAddress);
        salaryDetails.forEach((detail, index) => {
            addEmployeeData.append(`salaryDetails[${index}][source]`, detail.salarySource);
            addEmployeeData.append(`salaryDetails[${index}][amount]`, detail.salaryAmount);
            addEmployeeData.append(`salaryDetails[${index}][from_date]`, detail.fromDate);
            addEmployeeData.append(`salaryDetails[${index}][to_date]`, detail.toDate);
        });        
        addEmployeeData.append('aadhar_card_number', aadharCardNumber);
        addEmployeeData.append('aadhar_card_file', aadharCardFile);
        addEmployeeData.append('driving_license_number', drivingLicenseNumber);
        addEmployeeData.append('driving_license_file', drivingLicenseFile);
        addEmployeeData.append('pan_card_number', panCardNumber);
        addEmployeeData.append('pan_card_file', panCardFile);
        addEmployeeData.append('facebook_url', facebook);
        addEmployeeData.append('twitter_url', twitter);
        addEmployeeData.append('linkedin_url', linkedin);
        addEmployeeData.append('instagram_url', instagram);
        addEmployeeData.append('upwork_profile_url', upworkProfile);
        addEmployeeData.append('resume', resume);
        addEmployeeData.append('logged_in_employee_id', id);
        addEmployeeData.append('logged_in_employee_role', role);

        fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=add`, {
            method: "POST",
            body: addEmployeeData,
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                // Update the department list
                this.setState((prevState) => ({
                    //users: [...(prevState.users || []), data.data], // Assuming the backend returns the new department
                    selectedDepartment: "",
                    firstName: "",
                    lastName: "",
                    username: "",
                    email: "",
                    gender: "",
                    photo: null,
                    dob: "",
                    joiningDate: "",
                    mobile1: "",
                    mobile2: "",
                    password: "",
                    address1: "",
                    address2: "",
                    emergencyContact1: "",
                    emergencyContact2: "",
                    emergencyContact3: "",
                    skillsFrontend: [],
                    skillsBackend: [],
                    bankAccountName: "",
                    bankAccountNo: "",
                    bankName: "",
                    ifscCode: "",
                    bankAddress: "",
                    salaryDetails: [
                        { salarySource: "", salaryAmount: "", fromDate: "", toDate: "" },
                    ],
                    aadharCardNumber: "",
                    aadharCardFile: null,
                    drivingLicenseNumber: "",
                    drivingLicenseFile: null,
                    panCardNumber: "",
                    panCardFile: null,
                    facebook: "",
                    twitter: "",
                    linkedin: "",
                    instagram: "",
                    upworkProfile: "",
                    resume: null,
                    showSuccess: true,
                    successMessage: "Employee added successfully!",
                    errorMessage: "",
                    showError: false,
                }));

                setTimeout(this.dismissMessages, 5000);

                // Clear all file inputs
                Object.values(this.fileInputRefs).forEach((ref) => {
                    if (ref.current) ref.current.value = "";
                });
            } else {
                console.error("Failed to add employee details:", data);
                this.setState({
                    errorMessage: data.message || "Failed to add employee.",
                    showError: true,
                    showSuccess: false,
                });
            }
        })
        .catch(error => {
            console.error("Error adding employee:", error);
            this.setState({
                errorMessage: "An error occurred while adding the employee.",
                showError: true,
                showSuccess: false,
            });

            // setTimeout(this.dismissMessages, 3000);
        });
	};

    handleBack = () => {
        this.props.history.goBack(); // Navigate to the previous page
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
		const { fixNavbar } = this.props;
        const { firstName, lastName, username, email, gender, dob, joiningDate, mobile1, mobile2, password, address1, address2, emergencyContact1, emergencyContact2, emergencyContact3, skillsFrontend, skillsBackend,  bankAccountName, bankAccountNo, bankName, ifscCode, bankAddress, salaryDetails, aadharCardNumber, drivingLicenseNumber, panCardNumber, facebook, twitter, linkedin, instagram, upworkProfile} = this.state;
        
        // const { skillsFrontend, skillsBackend } = this.state;
        // Frontend and Backend Skill Options
        const frontendSkills = ["HTML", "CSS", "JavaScript", "React", "Angular", "Vue"];
        const backendSkills = ["PHP", "Laravel", "Python", "Node.js", "Symfony", "Django", "Ruby on Rails"];

		return (
            <>
                {/* Show success and error Messages */}
                {this.renderAlertMessages()}
                <div>
					<div className={`section-body ${fixNavbar ? "marginTop" : ""}`}>
						<div className="container-fluid">
							<div className="row">
								<div className="col-12 col-lg-12">
                                    <form className="card" onSubmit={this.addEmployee}>
                                        <div className="card-body">
                                            <h3 className="card-title">Add Employee</h3>
                                            <div className="row">
                                                {/* <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Employee ID</label>
                                                        <input type="text" className="form-control" placeholder="Employee ID" />
                                                    </div>
                                                </div> */}
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor="firstName">First Name</label>
                                                        <input
                                                            type="text"
                                                            name="firstName"
                                                            id="firstName"
                                                            className="form-control"
                                                            placeholder="Enter First Name"
                                                            value={firstName}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-6">
                                                    <div className="form-group">
                                                        <label className="form-label">Last Name</label>
                                                        <input
                                                            type="text"
                                                            name="lastName"
                                                            id='lastName'
                                                            className="form-control"
                                                            placeholder="Enter Last Name"
                                                            value={lastName}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">User Name</label>
                                                        <input
                                                            type="text"
                                                            name="username"
                                                            id='username'
                                                            className="form-control"
                                                            placeholder="Enter user name"
                                                            value={username}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Email address</label>
                                                        <input
                                                            type="email"
                                                            name="email"
                                                            id='email'
                                                            className="form-control"
                                                            placeholder="Enter Email Address"
                                                            value={email}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
                                                    <label className="form-label">Select Department</label>
													<div className="form-group">
														<select
															className="form-control show-tick"
															value={this.state.selectedDepartment}
															onChange={this.handleChange}
															name="selectedDepartment"
														>
															<option value="">Select Department</option>
															{this.state.departments.map((dept) => (
																<option key={dept.id} value={dept.id}>
																	{dept.department_name}
																</option>
															))}
														</select>
													</div>
												</div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Gender</label>
                                                        <select 
                                                            name="gender"
                                                            className="form-control"
                                                            id='gender'
                                                            value={gender}
                                                            onChange={this.handleChange}
                                                            required
                                                        >
                                                            <option value="">Select Gender</option>
                                                            <option value="male" >Male</option>
                                                            <option value="female" >Female</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Photo</label>
                                                        <input
                                                            type="file"
                                                            name="photo"
                                                            className="form-control"
                                                            onChange={this.handleFileChange}
                                                            ref={this.fileInputRefs.photo}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">DOB</label>
                                                        <input
                                                            type="date"
                                                            id="dob"
                                                            name="dob"
                                                            className="form-control"
                                                            value={dob}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Joining Date</label>
                                                        <input
                                                            type="date"
                                                            id="joiningDate"
                                                            name="joiningDate"
                                                            className="form-control"
                                                            value={joiningDate}
                                                            onChange={this.handleChange}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (1)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile1"
                                                            id="mobile1"
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={mobile1}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4">
                                                    <div className="form-group">
                                                        <label className="form-label">Mobile No (2)</label>
                                                        <input
                                                            type="tel"
                                                            name="mobile2"
                                                            id="mobile2"
                                                            className="form-control"
                                                            placeholder="Enter Mobile No"
                                                            value={mobile2}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4 col-sm-12">
													<div className="form-group">
                                                        <label className="form-label">Password</label>
														<input
															type="password"
															className="form-control"
															placeholder="Password"
															name='password'
															value={password}
															onChange={this.handleChange}
														/>
													</div>
												</div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 1</label>
                                                        <input
                                                            type="text"
                                                            name="address1"
                                                            id="address1"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 1"
                                                            value={address1}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Address Line 2</label>
                                                        <input
                                                            type="text"
                                                            name="address2"
                                                            id="address2"
                                                            className="form-control"
                                                            placeholder="Enter Address Line 2"
                                                            value={address2}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 1</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact1"
                                                        id="emergencyContact1"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact1}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 2</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact2"
                                                        id="emergencyContact2"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact2}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>
                                                <div className="col-sm-6 col-md-4 mb-4">
                                                    <label className="form-label">Emergency Contact 3</label>
                                                    <input
                                                        type="tel"
                                                        name="emergencyContact3"
                                                        id="emergencyContact3"
                                                        className="form-control"
                                                        placeholder="Enter Emergency Contact"
                                                        value={emergencyContact3}
                                                        onChange={this.handleChange}
                                                    />
                                                </div>

                                                {/* Frontend Skills */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Skills</h5>
                                                    <div className="col-sm-6 col-md-12">
                                                        <label className="form-label">Frontend</label>
                                                        <div className="d-flex flex-wrap">
                                                            {/* {frontendSkills.map((skill) => (
                                                                <label key={skill} className="mr-3 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    value={skill}
                                                                    checked={skillsFrontend.includes(skill)}
                                                                    onChange={(e) => this.handleSkillChange(e, "skillsFrontend")}
                                                                />{" "}
                                                                <span className={`tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))} */}
                                                            {frontendSkills.map((skill) => (
                                                                <label key={skill} className="colorinput mr-3 mb-2">
                                                                    <input
                                                                        name="color"
                                                                        type="checkbox"
                                                                        value={skill}
                                                                        checked={skillsFrontend.includes(skill)}
                                                                        onChange={(e) => this.handleSkillChange(e, "skillsFrontend")}
                                                                        className="colorinput-input"
                                                                    />
                                                                    <span className="colorinput-color bg-blue" />
                                                                    <span className={`ml-2 tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Backend Skills */}
                                                    <div className="col-sm-6 col-md-12">
                                                        <label className="form-label">Backend</label>
                                                        <div className="d-flex flex-wrap">
                                                            {/* {backendSkills.map((skill) => (
                                                                <label key={skill} className="mr-3 mb-2">
                                                                <input
                                                                    type="checkbox"
                                                                    value={skill}
                                                                    checked={skillsBackend.includes(skill)}
                                                                    onChange={(e) => this.handleSkillChange(e, "skillsBackend")}
                                                                />{" "}
                                                                <span className={`tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))} */}
                                                            {backendSkills.map((skill) => (
                                                                <label key={skill} className="colorinput mr-3 mb-2">
                                                                    <input
                                                                        name="color"
                                                                        type="checkbox"
                                                                        value={skill}
                                                                        checked={skillsBackend.includes(skill)}
                                                                        onChange={(e) => this.handleSkillChange(e, "skillsBackend")}
                                                                        className="colorinput-input"
                                                                    />
                                                                    <span className="colorinput-color bg-blue" />
                                                                    <span className={`ml-2 tag tag-${this.getColor(skill)} py-1 px-2`}>{skill}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Bank Account Detail */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Bank Account Details</h5>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Account Holder Name</label>
                                                            <input
                                                                type="text"
                                                                name="bankAccountName"
                                                                id="bankAccountName"
                                                                className="form-control"
                                                                placeholder="Account Holder Name"
                                                                value={bankAccountName}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Account Number</label>
                                                            <input
                                                                type="number"
                                                                name="bankAccountNo"
                                                                id="bankAccountNo"
                                                                className="form-control"
                                                                placeholder="Account Number"
                                                                value={bankAccountNo}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Bank Name</label>
                                                            <input
                                                                type="text"
                                                                name="bankName"
                                                                id="bankName"
                                                                className="form-control"
                                                                placeholder="Bank Name"
                                                                value={bankName}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">IFSC Code</label>
                                                            <input
                                                                type="text"
                                                                name="ifscCode"
                                                                id="ifscCode"
                                                                className="form-control"
                                                                placeholder="IFSC Code"
                                                                value={ifscCode}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>    
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Bank Address</label>
                                                            <input
                                                                type="text"
                                                                name="bankAddress"
                                                                id="bankAddress"
                                                                className="form-control"
                                                                placeholder="Bank Address"
                                                                value={bankAddress}
                                                                onChange={this.handleChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Salary Details */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Salary Details</h5>
                                                    {salaryDetails.map((entry, index) => (
                                                        <div key={index} className='w-100 col-sm-12'>
                                                            <div className="row">
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Salary Source</label>
                                                                        <select 
                                                                            name="salarySource"
                                                                            className="form-control"
                                                                            id='salarySource'
                                                                            value={entry.salarySource}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salarySource", e.target.value)}
                                                                        >
                                                                            <option value="">Select</option>
                                                                            <option value="IDBI Bank" >IDBI Bank</option>
                                                                            <option value="HDFC Bank" >HDFC Bank</option>
                                                                            <option value="Cash Payout" >Cash Payout</option>
                                                                            <option value="NEFT" >NEFT</option>
                                                                        </select>
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-3">
                                                                    <div className="form-group">
                                                                        <label className="form-label">Salary Amount</label>
                                                                        <input
                                                                            type="number"
                                                                            name="salaryAmount"
                                                                            id="salaryAmount"
                                                                            className="form-control"
                                                                            placeholder="Enter salary amount"
                                                                            value={entry.salaryAmount}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "salaryAmount", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-2">
                                                                    <div className="form-group">
                                                                        <label className="form-label">From</label>
                                                                        <input
                                                                            type="date"
                                                                            name="fromDate"
                                                                            id="fromDate"
                                                                            className="form-control"
                                                                            value={entry.fromDate}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "fromDate", e.target.value)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="col-sm-6 col-md-2">
                                                                    <div className="form-group">
                                                                        <label className="form-label">To</label>
                                                                        <input
                                                                            type="date"
                                                                            name="toDate"
                                                                            id="toDate"
                                                                            className="form-control"
                                                                            value={entry.toDate}
                                                                            onChange={(e) => this.handleSalaryDetails(index, "toDate", e.target.value)}
                                                                        />
                                                                    </div>    
                                                                </div>
                                                                {salaryDetails.length > 1 && (
                                                                    <div className="col-sm-6 col-md-2">
                                                                        <div className="form-group">
                                                                            <button
                                                                                type="button"
                                                                                title="Delete"
                                                                                className="btn btn-icon"
                                                                                style={{
                                                                                    marginTop: "1.2em",
                                                                                    fontSize: "1.2em",
                                                                                }}
                                                                                onClick={() => this.removeEntry(index)}
                                                                            >
                                                                                <i className="fa fa-trash-o text-danger" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <button type="button" className="btn btn-primary" onClick={this.addMore} >
                                                                Add More
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Govt Issue ID */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Govt Issue ID</h5>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Aadhar Card</label>
                                                            <input
                                                                type="text"
                                                                name="aadharCardNumber"
                                                                id="aadharCardNumber"
                                                                className="form-group form-control"
                                                                placeholder="Aadhar Card Number"
                                                                value={aadharCardNumber}
                                                                onChange={this.handleChange}
                                                            />
                                                            <input
                                                                type="file"
                                                                name="aadharCardFile"
                                                                className="form-control"
                                                                placeholder="Aadhar Card File"
                                                                onChange={this.handleFileChange}
                                                                ref={this.fileInputRefs.aadharCardFile}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Driving License</label>
                                                            <input
                                                                type="text"
                                                                name="drivingLicenseNumber"
                                                                id="drivingLicenseNumber"
                                                                className="form-group form-control"
                                                                placeholder="Driving License Number"
                                                                value={drivingLicenseNumber}
                                                                onChange={this.handleChange}
                                                            />
                                                            <input
                                                                type="file"
                                                                name="drivingLicenseFile"
                                                                className="form-control"
                                                                placeholder="Driving License"
                                                                onChange={this.handleFileChange}
                                                                ref={this.fileInputRefs.drivingLicenseFile}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-6 col-md-4">
                                                        <div className="form-group">
                                                            <label className="form-label">Pan Card</label>
                                                            <input
                                                                type="text"
                                                                name="panCardNumber"
                                                                id="panCardNumber"
                                                                className="form-group form-control"
                                                                placeholder="Pan Card Number"
                                                                value={panCardNumber}
                                                                onChange={this.handleChange}
                                                            />
                                                            <input
                                                                type="file"
                                                                name="panCardFile"
                                                                className="form-control"
                                                                placeholder="Pan Card"
                                                                onChange={this.handleFileChange}
                                                                ref={this.fileInputRefs.panCardFile}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Social Media */}
                                                <div className="row mb-4">
                                                    <h5 className="w-100">Social Media</h5>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Facebook</label>
                                                            <input
                                                                type="url"
                                                                name="facebook"
                                                                className="form-control"
                                                                value={facebook}
                                                                onChange={this.handleChange}
                                                                placeholder="https://facebook.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Twitter</label>
                                                            <input
                                                                type="url"
                                                                name="twitter"
                                                                className="form-control"
                                                                value={twitter}
                                                                onChange={this.handleChange}
                                                                placeholder="https://twitter.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Linkedin</label>
                                                            <input
                                                                type="url"
                                                                name="linkedin"
                                                                className="form-control"
                                                                value={linkedin}
                                                                onChange={this.handleChange}
                                                                placeholder="https://linkedin.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-lg-6 col-md-6">
                                                        <div className="form-group">
                                                            <label className="form-label">Instagram</label>
                                                            <input
                                                                type="url"
                                                                className="form-control"
                                                                name="instagram"
                                                                value={instagram}
                                                                onChange={this.handleChange}
                                                                placeholder="https://instagram.com/yourprofile"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Upwork Profile */}
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Upwork Profile</label>
                                                        <input
                                                            type="url"
                                                            name="upworkProfile"
                                                            className="form-control"
                                                            placeholder="Upwork Profile"
                                                            value={upworkProfile}
                                                            onChange={this.handleChange}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Resume */}
                                                <div className="col-md-12">
                                                    <div className="form-group">
                                                        <label className="form-label">Resume</label>
                                                        <input
                                                            type="file"
                                                            name="resume"
                                                            className="form-control"
                                                            placeholder="Select your resume"
                                                            onChange={this.handleFileChange}
                                                            ref={this.fileInputRefs.resume}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="card-footer text-right" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                                <button type="button" className="btn btn-secondary" onClick={this.handleBack}>
                                                    Back
                                                </button>
                                                <button type="submit" className="btn btn-primary">Add Employee</button>
                                        </div>
                                    </form>
								</div>
							</div>
						</div>
					</div>

				</div>
            </>
        );
    }

    // Helper function to assign color tags
    getColor(skill) {
        const colors = {
        HTML: "pink",
        CSS: "blue",
        JavaScript: "yellow",
        React: "cyan",
        Angular: "red",
        Vue: "green",
        PHP: "pink",
        Laravel: "blue",
        Python: "yellow",
        "Node.js": "cyan",
        Symfony: "red",
        Django: "purple",
        "Ruby on Rails": "orange",
        };
        return colors[skill] || "gray";
    }
}

const mapStateToProps = state => ({
    fixNavbar: state.settings.isFixNavbar
})

const mapDispatchToProps = dispatch => ({})
export default connect(mapStateToProps, mapDispatchToProps)(AddEmployee);