import dayjs from 'dayjs';
import minMax from 'dayjs/plugin/minMax';

// Extend dayjs with the minMax plugin
dayjs.extend(minMax);

export default dayjs; 