var i = 0;
function hohhah()
{
	postMessage("WOU!");
}
function timedCount() {
  i = i + 1;
  postMessage(i);
  if(i<10)
  {
	setTimeout(timedCount, 500);
  }
}



setTimeout(timedCount, 500);