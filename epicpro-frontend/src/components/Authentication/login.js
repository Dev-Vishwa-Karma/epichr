import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import authService from '../Authentication/authService';

export default class Login extends Component {

	constructor(props) {
		super(props);
		this.state = {
			email: "",
			password: "",
			error: null,
			user: null,
			emailError: false,
			passwordError: false,
			loginError: false,
			emailErrorMessage: '',
			passwordErrorMessage: '',
			loading: false, // State to manage the loader
		};
	}

	handleLoginIn = () => {

		const { email, password } = this.state;

		// Reset error messages
		let emailError = false;
		let passwordError = false;
		let emailErrorMessage = '';
		let passwordErrorMessage = '';

		// Validate email
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		if (!email) {
			emailError = true;
			emailErrorMessage = 'Email is required';
		} else if (!emailRegex.test(email)) {
			emailError = true;
			emailErrorMessage = 'Please enter a valid email address';
		}

		// Validate password
		if (!password) {
			passwordError = true;
			passwordErrorMessage = 'Password is required';
		}

		if (emailError || passwordError) {
			this.setState({
				emailError,
				passwordError,
				emailErrorMessage,
				passwordErrorMessage,
			});
			return; // Prevent API call if validation fails
		}

		// Start loader when the login process begins
		this.setState({ loading: true });

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
				// Stop loader when API response is received
				this.setState({ loading: false });

				if (data.status === "success") {

					// Store user data in local storage
					localStorage.setItem('user', JSON.stringify(data.data));

					// Update state with user data
					this.setState({ user: data.data }, () => {
						// Log user role after state update
						console.log("User Role:", this.state.user.role);
					});

					// Store user data in localstorage using authService
					authService.setUser(data.data);

					// Call onLogin function from App.js
					if (this.props.onLogin) {
						this.props.onLogin(data.data);
					}

					// Redirect to the dashboard or another page
					this.props.history.push('/');

				} else {
					this.setState({ loginError: data.message, emailError: false, passwordError: false });
					console.log("Failed to login");

					// Hide the error message after 5 seconds
					setTimeout(() => {
						this.setState({ loginError: null });
					}, 5000);
				}
			})
			.catch((error) => {
				// Stop loader in case of error
				this.setState({ loading: false });
				this.setState({ loginError: 'Something went wrong. Please try again.', emailError: false, passwordError: false });
				console.error("Error:", error);
				// Hide the error message after 5 seconds
				setTimeout(() => {
					this.setState({ loginError: null });
				}, 5000);
			});

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
		const { email, password, emailError, passwordError, loginError, emailErrorMessage, passwordErrorMessage, loading } = this.state;
		return (
			<div className="auth">
				<div className="auth_left">
					<div className="card">
						<div className="text-center mb-2">
							<Link className="header-brand" to="/">
								<i className="fe fe-command brand-logo" />
							</Link>
						</div>
						{loginError && <div className="card-alert alert alert-danger mb-0">{loginError}</div>}
						<div className={`card-body ${loading ? 'dimmer active' : 'dimmer'}`}>
							<div className="card-title">Login to your account</div>
							{loading && <div className="loader"></div>}
							<div className="dimmer-content">
								<div className="form-group">
									<input
										type="email"
										className={`form-control ${emailError ? 'is-invalid' : ''}`}
										id="exampleInputEmail1"
										aria-describedby="emailHelp"
										placeholder="Enter email"
										value={email}
										onChange={this.handleEmailChange}
									/>
									{emailError && <div className="invalid-feedback">{emailErrorMessage}</div>}
								</div>
								<div className="form-group">
									<label className="form-label">
									</label>
									<input
										type="password"
										className={`form-control ${passwordError ? 'is-invalid' : ''}`}
										id="exampleInputPassword1"
										placeholder="Password"
										value={password}
										onChange={this.handlePasswordChange}
									/>
									{passwordError && <div className="invalid-feedback">{passwordErrorMessage}</div>}
								</div>
								<div className="form-footer">
									<a className="btn btn-primary btn-block" href="#" onClick={this.handleLoginIn}>
										Click to login
									</a>
								</div>
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
