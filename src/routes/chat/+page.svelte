<script>
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Eliza from 'elizabot';
	import { beforeUpdate, afterUpdate } from 'svelte';
	import autosize from 'autosize';
	import { onMount } from 'svelte';
	import { createParser } from 'eventsource-parser';
	import { systemMessage } from '$lib';
	import { marked } from 'marked';
	import DOMPurify from 'isomorphic-dompurify';

	let accumulated = '';

	const parser = createParser((event) => {
		if (event.type === 'message') {
			console.log('message received: ', event.data);
		} else {
			// console.log('Event type: ', event.type);
			if (event.data != '[DONE]') {
				try {
					const data = JSON.parse(event.data);
					const textContent = data.choices[0].delta.content;
					accumulated += textContent;
					// console.log('Data received: ', data.choices[0].delta);
					// console.log(accumulated);
					messages = messages.slice(0, -1); // have to remove previous messages too
					messages = [...messages, { role: 'assistant', content: accumulated }];
				} catch (error) {
					console.error('Error parsing JSON:', error, event.data);
					return;
				}
			}
		}
	});

	async function streamResponse(messagesHistory) {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ messages: messagesHistory }),
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
			if (done) {
				messages = messages.slice(0, -1);
				messages = [...messages, { role: 'assistant', content: accumulated }];
			}
		}
	}

	let div;
	let autoscroll = false;

	onMount(() => {
		const textarea = document.getElementById('autoExpand');
		autosize(textarea);

		textarea.addEventListener('autosize:resized', function () {
			console.log(textarea.scrollHeight);
			if (textarea.scrollHeight > 150) {
				textarea.style.height = '150px';
				textarea.style.overflowY = 'scroll'; // Add scroll when max height is reached
			} else {
				textarea.style.overflowY = 'hidden'; // Hide scroll if under max height
			}
		});
	});

	beforeUpdate(() => {
		if (div) {
			const scrollableDistance = div.scrollHeight - div.offsetHeight;
			autoscroll = div.scrollTop > scrollableDistance - 20;
		}
	});

	afterUpdate(() => {
		if (autoscroll) {
			div.scrollTo(0, div.scrollHeight);
		}
	});

	let messages = [systemMessage];
	let currentInput = '';

	async function handleKeydown(event) {
		// Check if Enter is pressed without Shift (prevent newline insertion)
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault(); // Prevents the default newline character
			if (currentInput.trim() !== '') {
				// Ensure there's text to send
				const userMessage = {
					role: 'user',
					content: currentInput.trim(),
				};

				messages = [
					...messages,
					userMessage,
					{ role: 'system', content: 'placeholder' },
				];

				currentInput = '';
				await streamResponse(messages);

				accumulated = ''; // reset accumulated text
			}
		}
	}

	const parseMarkdown = (text) => {
		DOMPurify.sanitize(marked.parse(text));
		return text;
	};
</script>

<div class=" container flex flex-col h-screen w-screen items-center">
	<div
		class="flex flex-col flex-auto overflow-y-auto p-4 bg-slate w-3/5 pr-6"
		bind:this={div}
	>
		<header class="mb-4">
			<h2
				class="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0"
			>
				my chat
			</h2>
		</header>

		{#each messages as message}
			<article
				class={`my-2 ${message.role == 'user' ? 'text-right' : message.role == 'system' ? 'hidden' : ''}`}
			>
				<span
					class={`inline-block max-w-xs break-words py-2 px-4 rounded-lg ${
						message.role === 'user'
							? 'bg-blue-500 text-white rounded-br-none'
							: 'bg-stone-100 text-black rounded-bl-none'
					}`}>{@html parseMarkdown(message.content)}</span
				>
			</article>
		{/each}
	</div>

	<div id="input-container" class="p-4 w-3/5">
		<Textarea
			on:keydown={handleKeydown}
			placeholder="Type your message..."
			class="w-fulls border rounded-lg p-2 resize-none focus:border-stone-500 focus:outline-none text-base max-h-40 overflow-x-hidden"
			bind:value={currentInput}
			id="autoExpand"
		/>
	</div>
</div>

<style>
	.container {
		background: linear-gradient(135deg, #0d0d19, #0a0a14);
	}
</style>
