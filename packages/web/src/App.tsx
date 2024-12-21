import "./App.css";
import { Routes, Route } from "react-router-dom";
import SubmitForm from "./pages/SubmitForm";
import FetchArticles from "./pages/FetchArticles";
import EditForm from "./pages/EditForm";

function App() {
	return (
		<Routes>
			{/* <Route path="/" element={<Navigate to="/articles" />} /> */}
			<Route path="/submit" element={<SubmitForm />} />
			<Route path="/edit/:id" element={<EditForm />} />
			<Route path="/" element={<FetchArticles />} />
		</Routes>
	);
}

export default App;
