// @ts-ignore
import 'rc-table/assets/index.css';
import RcTable from 'rc-table';

const Table = ({ data, ...props }: any) => {
	const normalizedData = Array.isArray(data)
		? data
		: Array.isArray(data?.data)
			? data.data
			: [];

	return <RcTable {...props} data={normalizedData} />;
};

export { Table };
