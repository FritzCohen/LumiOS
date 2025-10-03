import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorState {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorState> {
	constructor(props: { children: ReactNode }) {
		super(props);
		this.state = { hasError: false, error: null, errorInfo: null };
	}

	static getDerivedStateFromError(error: Error): ErrorState {
		// Return updated state
		return {
			hasError: true,
			error,
			errorInfo: null,
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("Error caught by ErrorBoundary:", error, errorInfo);
		this.setState({ errorInfo });
	}

	render() {
		if (this.state.hasError) {
			return (
				<div
					style={{ background: "#4285f4" }}
					className="flex flex-col justify-center items-center max-h-screen py-20"
				>
					<div id="page" className="text-lg">
						<div className="flex flex-col gap-2 my-5">
							<h1 className="text-6xl mb-10">:(</h1>
							<h2>
								Your PC ran into a problem and needs to restart.
								We're just collecting some error info, and then
								we'll restart for you.
							</h2>
							<h2>
								<span id="percentage">0</span>% complete
							</h2>
							<div
								id="details"
								className="flex flex-col md:flex-row items-center md:items-start pt-10"
							>
								<div id="qr" className="mb-5 md:mb-0 md:mr-10">
									<div
										id="image"
										className="bg-white p-5 leading-0"
									>
										<img
											src="https://win11.blueedge.me/img/qr.png"
											alt="QR Code"
											className="w-9.8em h-9.8em"
										/>
									</div>
								</div>
								<div id="stopcode">
									<h4 className="text-xl leading-1.5em mb-5">
										For more information about this issue
										and possible fixes, visit
										<br />
										<a href="https://github.com/LuminesenceProject/LumiOS/issues">
											https://github.com/LuminesenceProject/LumiOS/issues
										</a>
									</h4>
									<h5 className="leading-22px text-base font-normal">
										If you call a support person, give them
										this info:
										<br />
										Error:{" "}
										{this.state.error?.message ?? "Unknown"}
									</h5>
									<div className="flex flex-row gap-5 p-10">
										<button
											onClick={() =>
												window.location.reload()
											}
											className="p-2 text-text-base bg-primary hover:bg-secondary-light transition-all duration-200 active:scale-95 rounded"
										>
											Try again
										</button>
										<button
											className="p-2 text-text-base bg-primary hover:bg-secondary-light transition-all duration-200 active:scale-95 rounded"
											onClick={() => {
												localStorage.clear();
												sessionStorage.clear();
												indexedDB.deleteDatabase(
													"FileSystem"
												);
											}}
										>
											Reset Lumi OS
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;