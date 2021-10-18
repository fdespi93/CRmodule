<?php 
	defined('BASEPATH') OR exit('No direct script access allowed');

	class coderef_model extends CI_Model{
	    function __construct(){
	        parent::__construct();
	        //load our second db and put in $db2
	        // $this->db_is = $this->load->database('phocov', TRUE);
	    }

		public function updateDB($db,$table,$data,$cond)
		{
			$dbc = $this->getDB($db);

			// if($cond!=''){
				$dbc->where($cond);
			// }
			if($dbc->update($table, $data))
				return true;
			else
				return false;

		}

	/* read Code Reference */	
		private function getDB($dbname)
		{
			return $this->load->database($dbname, TRUE);
		}

		public function ExecuteQuery($db,$query,$cond="")
		{
			$dbc = $this->getDB($db);

			if($cond!=''){
				$dbc->where($cond);
			}

			if($dbc->query($query)){
				return true;
			}
			else{
				return false;
			}
		}

		public function ExecuteQuery_RetList($db,$query,$cond="")
		{
			$dbc = $this->getDB($db);

			if($cond!=''){
				$dbc->where($cond);
			}
			
			$query = $dbc->query($query);
			$results = $query->result();
			return $results;
		}

		public function updateDB_DocSeries($db,$id)
		{
			$dbc = $this->getDB($db);

	 		$dbc->set('trx_docnum',"trx_docnum+1", FALSE);
			$dbc->where('trx_code', $id);
			if($dbc->update('DocumentSeries'))
				return true;
			else
				return false;
		}

		public function get_DocSeries($db,$code)
		{
			$dbc = $this->getDB($db);

			$dbc->where('a.trx_code', $code);
			$dbc-> limit(1);
			$query = $dbc->get('DocumentSeries as a');
			$results = $query->result();
			return $results;
		}

		public function get_LastDocSeries($db, $code, $desc)
		{
			$dbc = $this->getDB($db);
			$docser = $this->get_DocSeries($db, $code);

			if(!$docser){
	          	$datatrans = array('trx_code' => strtoupper($code), 
		                           'trx_docnum' => 0, 
		                           'trx_description' => $desc,
		                           'created_by' => $this->session->userdata['logged_in']['username'],
		                           'modified_by' => $this->session->userdata['logged_in']['username']);

	          	if($dbc->insert('DocumentSeries', $datatrans)){

					$dbc->where('a.trx_code', $code);
					$dbc-> limit(1);
					$query = $dbc->get('DocumentSeries as a');
					$results = $query->result();

					return $results;
	          	} 
			}
			else
				return $docser;
		}

		public function get_CodeReferenceList($db, $code='')
		{
			$dbc = $this->getDB($db);

			if($code)
				$dbc->where('a.ParentCode', $code);

			$dbc->where('a.IsDeleted', 0);
			$dbc->order_by('a.Descr', "ACS");
			$query = $dbc->get('CodeReferenceDetail as a');
			$results = $query->result();
			return $results;
		}

	/* END Code Reference */

	/* CUD Code Reference */	
		public function insert_CodeReference($db,$data,$code,$ret=false)
		{
			$dbc = $this->getDB($db);
			$desc = $data['Descr'];

	        $lastid = $this->coderef_model->get_LastDocSeries($db,$code,$desc);
	        $lastcode = strtoupper($code).'-'.str_pad(($lastid[0]->trx_docnum + 1), 5, '0', STR_PAD_LEFT);

			$data['Code'] = $lastcode;

			if($dbc->insert('CodeReferenceDetail', $data))
			{
				$this->updateDB_DocSeries($db, $code);
				if($ret){
					return $lastcode;
				}
				
				return true;
			}
			else
				return false; 
		}

		public function delete_CodeReference($db,$pc,$code)
		{
			$dbc = $this->getDB($db);

			$dbc->where('Code', $code);
			$dbc->where('ParentCode', $pc);
	 		$data = array('IsDeleted' => 1, 'modified_by' => $this->session->userdata['logged_in']['username'], 'modified_date' => date("Y-m-d H:i:s"));
	 		
			if($dbc->update('CodeReferenceDetail', $data))
				return true;
			else
				return false;
		}
	/* END CUD Code Reference */

	}
?>