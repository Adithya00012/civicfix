self.addEventListener("push", (event) => {
  let data = { title: "CivicFix", body: "You have a new update." };
  try {
    data = event.data.json();
  } catch (e) {
    data.body = event.data.text();
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/vite.svg",
    })
  );
});