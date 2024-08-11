<script>
	import { onMount } from 'svelte';
	import { createParser } from 'eventsource-parser';

	let accumulated = '';

	const parser = createParser((event) => {
		if (event.type === 'comment') {
			console.log('Comment received: ', event.data);
		} else {
			// console.log('Event type: ', event.type);
			if (event.data != '[DONE]') {
				try {
					const data = JSON.parse(event.data);
					const textContent = data.choices[0].delta.content;
					accumulated += textContent;
					console.log('Data received: ', data.choices[0].delta);
					console.log(accumulated);
				} catch (error) {
					console.error('Error parsing JSON:', error, event.data);
					return;
				}
			}
		}
	});

	async function streamResponse(userText) {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ userText }),
		});

		if (!response.body) {
			console.error('ReadableStream not yet supported in this browser');
			return;
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();

		let done = false;

		while (!done) {
			const { value, done: readerDone } = await reader.read();
			done = readerDone;

			const chunk = decoder.decode(value, { stream: true });
			parser.feed(chunk);
			// accumulated += decoder.decode(value, { stream: !done });
		}
	}

	onMount(() => {
		// streamResponse('Hello');
	});
</script>

<h1>Check your console for info</h1>
