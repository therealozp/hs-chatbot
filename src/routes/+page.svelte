<script>
	import Button from '$lib/components/ui/button/button.svelte';
</script>

<div class="landing-page">
	<h1
		class="gradient-text scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl"
	>
		the AI chatbot of all time
	</h1>
	<p class="subheader">this is one of the projects of all time</p>
	<form action="/chat">
		<button type="submit" class="chat-button">chat now</button>
	</form>
</div>

<style>
	/* Full-page gradient background */
	.chat-button {
		margin-top: 20px;
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		transition: all 0.15s ease-in-out;
		background: whitesmoke;
		color: #000;
		font-size: larger;
	}
	.chat-button:hover {
		background: #ff7e5f;
		color: #fff;
		border-radius: 30px;
	}
	.landing-page {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background: linear-gradient(135deg, #1e1e30, #0a0a14);
		color: #fff;
		text-align: center;
	}

	/* Moving gradient text for the header */
	.gradient-text {
		font-size: 4rem;
		background: linear-gradient(270deg, #ff7e5f, #feb47b, #86a8e7, #91eac9);
		background-size: 800% 800%;
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		animation: gradient-animation 8s ease infinite;
	}

	/* Subheader styling */
	.subheader {
		font-size: 1.2rem;
		margin-top: 20px;
		color: #d3d3d3;
	}

	/* Gradient animation */
	@keyframes gradient-animation {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
