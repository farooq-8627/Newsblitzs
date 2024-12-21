import { useNavigate } from "react-router-dom";
import ArticleForm from "../components/Form";

const SubmitForm = () => {
	const navigate = useNavigate();
	const handleSuccess = () => {
		navigate("/");
	};

	return <ArticleForm mode="submit" onSuccess={handleSuccess} />;
};

export default SubmitForm;
