async function main() {
  /**
   * @type HTMLElement
   * */
  const main = document.querySelector('main');

  try {
    /*   const fpjs = await load({
      apiKey: import.meta.env.VITE_FPJS_API_KEY,
      endpoint: import.meta.env.VITE_FPJS_ENDPOINT,
      scriptUrlPattern: import.meta.env.VITE_FPJS_SCRIPT_URL_PATTERN,
      region: import.meta.env.VITE_FPJS_REGION,
    });*/

    // TODO Uncomment once it is ready for production, for now disabled to avoid unnecessary api calls
    //  const result = await fpjs.get();
    const result = {
      visitorId: '123',
    };

    main.textContent = `Visitor identified: ${result.visitorId}`;
    main.dataset.success = 'true';
    main.dataset['visitorid'] = result.visitorId;
  } catch (error) {
    main.textContent = `Error: ${error}`;
    main.dataset.success = 'false';
  }
}

void main();
