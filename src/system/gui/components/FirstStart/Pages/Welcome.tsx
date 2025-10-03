const Welcome = () => {
	return (
		<>
			<div className="flex flex-col justify-center text-left">
				<p>Get started on your new favorite OS!</p>
				<p className="text-xs text-end">
					By continuing, you agree to our{" "}
					<a
						href="https://github.com/LuminesenceProject/LumiOS"
						className="cursor-pointer"
						style={{ color: "lightblue" }}
					>
						terms and conditions
					</a>
					.
				</p>
			</div>
		</>
	);
};

export default Welcome;