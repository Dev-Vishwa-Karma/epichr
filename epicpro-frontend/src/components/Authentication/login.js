import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Login extends Component {

	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: "",
			error: null,
			user: null
		};
	}

	handleLoginIn = () => {

		const { email, password } = this.state;

		// Validate form inputs
		if (!email || !password) {
			alert("All the fields are required!");
			return;
		}

		const formData = new FormData();
		formData.append('email', email);
		formData.append('password', password);

		// API call to add break
		fetch(`${process.env.REACT_APP_API_URL}/get_employees.php?action=check-login`, {
			method: "POST",
			body: formData,
		})
			.then((response) => response.json())
			.then((data) => {
				if (data.status === "success") {
					//alert(data.message);

					// Store user data in local storage
					localStorage.setItem('user', JSON.stringify(data.data));

					// Update state with user data
					this.setState({ user: data.data }, () => {
						// Log user role after state update
						console.log("User Role:", this.state.user.role);
					});

					// Redirect to the dashboard or another page
					this.props.history.push('/');

				} else {
					alert(data.message);
					console.log("Failed to login");
				}
			})
			.catch((error) => console.error("Error:", error));

	};

	// Handle input change
	handleEmailChange = (event) => {
		this.setState({ email: event.target.value });
	};

	// Handle input change
	handlePasswordChange = (event) => {
		this.setState({ password: event.target.value });
	};

	render() {
		const { email, password } = this.state;
		return (
			<div className="auth">
				<div className="auth_left">
					<div className="card">
						<div className="text-center mb-2">
							<Link className="header-brand" to="/">
								<i className="fe fe-command brand-logo" />
							</Link>
						</div>
						<div className="card-body">
							<div className="card-title">Login to your account</div>
							{/* <div className="form-group">
								<select className="custom-select">
									<option>HR Dashboard</option>
									<option>Project Dashboard</option>
									<option>Job Portal</option>
								</select>
							</div> */}
							<div className="form-group">
								<input
									type="email"
									className="form-control"
									id="exampleInputEmail1"
									aria-describedby="emailHelp"
									placeholder="Enter email"
									value={email}
									onChange={this.handleEmailChange}
								/>
							</div>
							<div className="form-group">
								<label className="form-label">
									{/* Password */}
									{/* <Link className="float-right small" to="/forgotpassword">
										I forgot password
									</Link> */}
								</label>
								<input
									type="password"
									className="form-control"
									id="exampleInputPassword1"
									placeholder="Password"
									value={password}
									onChange={this.handlePasswordChange}
								/>
							</div>
							{/* <div className="form-group">
								<label className="custom-control custom-checkbox">
									<input type="checkbox" className="custom-control-input" />
									<span className="custom-control-label">Remember me</span>
								</label>
							</div> */}
							<div className="form-footer">
								<a className="btn btn-primary btn-block" href="#" onClick={this.handleLoginIn}>
									Click to login
								</a>
							</div>
						</div>
					</div>
				</div>
				<div className="auth_right">
					<div className="carousel slide" data-ride="carousel" data-interval={3000}>
						<div className="carousel-inner">
							<div className="carousel-item active">
								<img src="assets/images/slider1.svg" className="img-fluid" alt="login page" />
								<div className="px-4 mt-4">
									<h4>Fully Responsive</h4>
									<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="assets/images/slider2.svg" className="img-fluid" alt="login page" />
								<div className="px-4 mt-4">
									<h4>Quality Code and Easy Customizability</h4>
									<p>There are many variations of passages of Lorem Ipsum available.</p>
								</div>
							</div>
							<div className="carousel-item">
								<img src="assets/images/slider3.svg" className="img-fluid" alt="login page" />
								<div className="px-4 mt-4">
									<h4>Cross Browser Compatibility</h4>
									<p>Overview We're a group of women who want to learn JavaScript.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
