import { OPENROUTER_API_KEY } from '$env/static/private';

export const POST = async ({ request }) => {
	const body = await request.json();
	const { messages } = body;
	const messagesRemovedPlaceholder = messages.slice(0, -1);
	const response = await fetch(
		'https://openrouter.ai/api/v1/chat/completions',
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${OPENROUTER_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				model: 'meta-llama/llama-3.1-8b-instruct:free',
				messages: messagesRemovedPlaceholder,
				stream: true, // Enable streaming
				// max_tokens: 200,
			}),
		}
	);

	if (!response.ok) {
		throw new Error(`HTTP error! Status: ${response.status}`);
	}

	const stream = new ReadableStream({
		start(controller) {
			const decoder = new TextDecoder();
			const reader = response.body.getReader();

			async function push() {
				const { done, value } = await reader.read();
				if (done) {
					controller.close();
					return;
				}

				const chunk = decoder.decode(value, { stream: true });
				controller.enqueue(new TextEncoder().encode(chunk));
				push();
			}

			push();
		},
	});

	return new Response(stream, {
		headers: { 'Content-Type': 'text/event-stream' },
	});
};
