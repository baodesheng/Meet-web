<?php
/**
 * Liba Database Class.
 */
class Liba_Database {
    /**
     * @var string 
     */
    private $_host;
    
    /**
     * @var string
     */
    private $_user;
    
    /**
     * @var string
     */
    private $_password;
    
    /**
     * @var string
     */
    private $_databaseName;
    
    /**
     * @var string
     */
    private $_charset;
    
    /**
     * @var integer
     */
    private $_queryCount;
    
    /**
     * @var resource
     */
    private $_linkId;
    
    /**
     * @var bool
     */
    private $_debugMode;
    
    /**
     * @var bool
     */
    private $_stopOnError;
    
    public function  __construct($databaseConfig) {
        $this->_host = $databaseConfig['host'];
        $this->_user = $databaseConfig['user'];
        $this->_password = $databaseConfig['pass'];
        $this->_databaseName = $databaseConfig['name'];
        
        if ($databaseConfig['charset']) {
            $this->_charset = $databaseConfig['charset'];
        } else {
            $this->_charset = 'utf8';
        }
        
        $this->_queryCount = 0;
        $this->_debugMode = false;
        $this->_stopOnError = true;
        
        unset($databaseConfig);
    }
    
    public function  __destruct() {
        $this->close();
    }

    /**
     * Select database by name.
     * 
     * @param  string $databaseName 
     * @return void
     */
    public function selectDatabase($databaseName) {
        if (!empty($databaseName)) {
            $isSucceed = @mysql_select_db($databaseName, $this->_linkId);
            
            if (!$isSucceed) {
                $this->errorReport("系统繁忙，请刷新后重试。<!-- 无法选择{$this->_host}数据库{$databaseName} -->");
            }
        }
    }
    
    /**
     * Connect database server via settings.
     * 
     * @return void
     */
    private function _connectDatabaseServer() {
        $this->close();
        
        $this->_linkId = mysql_connect($this->_host, $this->_user, $this->_password, 1, MYSQL_CLIENT_COMPRESS);
        if (empty($this->_linkId)) {
            $this->errorReport("系统繁忙，请刷新后重试。<!-- 无法连接数据库服务器{$this->_host} -->");
        }
        
        $version = floatval(mysql_get_server_info($this->_linkId));
        if ($version > 4.1) {
            mysql_query("SET character_set_connection={$this->_charset}, character_set_results={$this->_charset}, character_set_client=binary", $this->_linkId);
            mysql_query("SET sql_mode=''", $this->_linkId);
        } else {
            mysql_query("set names '{$this->_charset}'");
        }
        
        $this->selectDatabase($this->_databaseName);
    }
    
    /**
     * Escapes a string for use in a mysql_query.
     * 
     * @param  string $string
     * @return string
     */
    public function safeString($string) {
        return mysql_escape_string($string);
    }
    
    /**
     * Free result memory.
     * 
     * @param  resource $result
     * @return bool
     */
    public function freeResult($result) {
        return @mysql_free_result($result);
    }
    
    /**
     * Get a result row as an enumerated array.
     * 
     * @param  resource $result
     * @return array
     */
    public function fetchRow($result) {
        return @mysql_fetch_row($result);
    }
    
    /**
     * Fetch a result row as an associative array.
     * 
     * @param  resource $result
     * @return array
     */
    public function fetchAssociative($result) {
        return @mysql_fetch_assoc($result);
    }
    
    /**
     * Fetch a result row as an associative array.
     * 
     * @see    Liba_Database::fetchAssociative()
     * 
     * @param  resource $result
     * @return array
     */
    public function fetchArray($result) {
        return $this->fetchAssociative($result);
    }
    
    /**
     * Fetch a result row as an object.
     * 
     * @param <type> $result
     * @return <type> 
     */
    public function fetchObject($result) {
        return @mysql_fetch_object($result);
    }
    
    /**
     * Get number of affected rows in previous MySQL operation.
     * 
     * @return integer
     */
    public function affectedRows() {
        return @mysql_affected_rows($this->_linkId);
    }
    
    /**
     * Get number of affected rows in previous MySQL operation.
     * 
     * @return integer
     */
    public function affectedRowCount() {
        return $this->affectedRows();
    }
    
    /**
     * Get the ID generated from the previous INSERT operation.
     * 
     * @return integer
     */
    public function insertId() {
        return mysql_insert_id($this->_linkId);
    }
    
    /**
     * Close current database connection.
     * 
     * @return void
     */
    public function close() {
        if (!empty($this->_linkId)) {
            @mysql_close($this->_linkId);
        }
    }
    
    /**
     * Get current database server system status.
     * 
     * @return string
     */
    public function stat() {
        return @mysql_stat($this->_linkId);
    }
    
    public function errorReport($message) {
        die($message);
    }

    /**
     * Execute a MySQL query.
     * 
     * @param  string $sql
     * @param  string $resultType
     * @return mixed
     */
    public function query($sql, $resultType = '') {
        $sql = trim($sql);
        
        if (empty($sql)) {
            //TODO: Empty SQL execute exception handler.
            return false;
        }
        
        if (empty($this->_linkId)) {
            $this->_connectDatabaseServer();
        }
        
        $result = mysql_query($sql, $this->_linkId);
        if (empty($result)) {
            $this->_connectDatabaseServer();
            $result = mysql_query($sql, $this->_linkId);
        }
        
        if (empty($result)) {
            return false;
        }
        
        $this->_queryCount++;
        
        $resultType = strtolower($resultType);
        switch ($resultType) {
            case '1':
            case 'one':
            case 'first':
                $row = $this->fetchRow($result);
                return $row[0];
                break;
            
            case 'row':
                return $this->fetchRow($result);
                break;
            
            case 'array':
            case 'assoc':
            case 'associative':
                return $this->fetchAssociative($result);
                break;
            
            case 'object':
            case 'obj':
                return $this->fetchObject($result);
                break;
            
            case 'all':
                $resultArray = array();
                $arrayIndex = 0;
                while ($tmpArray = $this->fetchArray($result)) {
                    $resultArray[$arrayIndex] = $tmpArray;
                    $arrayIndex++;
                }
                return $resultArray;
                break;
                
            case '':
            case 'succeed':
            case 'is_succeed':
                return true;
                break;
            
            case 'rowcount':
                return $this->affectedRowCount();
                break;
            
            default:
                return $result;
                break;
        }
    }
}
